import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Account } from '../accounts/account.entity.js';
import { Transfer, TransferStatus } from './transfer.entity.js';
import { CreateTransferDto } from './dto/create-transfer.dto.js';

@Injectable()
export class TransfersService {
  constructor(private readonly dataSource: DataSource) {}

  async executeTransfer(
    dto: CreateTransferDto,
    currentUserId: string,
  ): Promise<Transfer> {
    if (dto.fromCardNumber === dto.toCardNumber) {
      throw new BadRequestException('Нельзя перевести средства на ту же самую карту');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Поиск и блокировка карты отправителя (SELECT ... FOR UPDATE)
      const fromCard = await queryRunner.manager.findOne(Account, {
        where: { cardNumber: dto.fromCardNumber },
        lock: { mode: 'pessimistic_write' },
      });

      if (!fromCard) {
        throw new NotFoundException(`Карта списания ${dto.fromCardNumber} не найдена`);
      }

      // Банковская проверка: списание возможно только с карты авторизованного клиента!
      if (fromCard.userId !== currentUserId) {
        throw new BadRequestException('Запрещено совершать операции по чужой банковской карте');
      }

      // 2. Поиск и блокировка карты получателя
      const toCard = await queryRunner.manager.findOne(Account, {
        where: { cardNumber: dto.toCardNumber },
        lock: { mode: 'pessimistic_write' },
      });

      if (!toCard) {
        throw new NotFoundException(`Карта получателя ${dto.toCardNumber} не найдена`);
      }

      // 3. Проверка остатка на балансе
      if (Number(fromCard.balance) < Number(dto.amount)) {
        throw new BadRequestException(
          `Недостаточно средств. На карте: ${fromCard.balance} ₽, к списанию: ${dto.amount} ₽`,
        );
      }

      // 4. Атомарное изменение балансов
      fromCard.balance = Number(fromCard.balance) - Number(dto.amount);
      toCard.balance = Number(toCard.balance) + Number(dto.amount);

      await queryRunner.manager.save(fromCard);
      await queryRunner.manager.save(toCard);

      // 5. Формирование проводки перевода
      const transfer = queryRunner.manager.create(Transfer, {
        fromAccountId: fromCard.id,
        toAccountId: toCard.id,
        amount: dto.amount,
        status: TransferStatus.SUCCESS,
      });

      const savedTransfer = await queryRunner.manager.save(transfer);

      // 6. Фиксация транзакции (Commit)
      await queryRunner.commitTransaction();

      return savedTransfer;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(): Promise<Transfer[]> {
    return this.dataSource.getRepository(Transfer).find({
      order: { createdAt: 'DESC' },
    });
  }
}