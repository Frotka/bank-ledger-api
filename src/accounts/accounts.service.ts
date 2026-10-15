import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from './account.entity.js';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
  ) {}

  generateCardNumber(): string {
    let result = '2200';
    for (let i = 0; i < 12; i++) {
      result += Math.floor(Math.random() * 10).toString();
    }
    return result;
  }

  async createCardForUser(userId: string, initialBalance = 50000): Promise<Account> {
    const card = this.accountRepository.create({
      userId,
      cardNumber: this.generateCardNumber(),
      balance: initialBalance,
      currency: 'RUB',
    });

    return this.accountRepository.save(card);
  }

  async findAll(): Promise<Account[]> {
    return this.accountRepository.find({ relations: { user: true } });
  }

  async findByCardNumber(cardNumber: string): Promise<Account> {
    const card = await this.accountRepository.findOne({
      where: { cardNumber },
      relations: {
        user: true,
        outgoingTransfers: true,
        incomingTransfers: true,
      },
    });

    if (!card) {
      throw new NotFoundException(`Карта ${cardNumber} не найдена`);
    }

    return card;
  }

  /**
   * Удаление банковской карты клиента
   * @param cardNumber 16-значный номер карты
   * @param currentUserId ID авторизованного пользователя из JWT
   */
  async deleteCard(
    cardNumber: string,
    currentUserId: string,
    currentUserRole: string,
  ): Promise<{ message: string }> {
    const card = await this.accountRepository.findOne({
      where: { cardNumber },
    });

    if (!card) {
      throw new NotFoundException(`Карта с номером ${cardNumber} не найдена`);
    }

    // Если это не админ, проверяем владение картой
    if (currentUserRole !== 'ADMIN' && card.userId !== currentUserId) {
      throw new ForbiddenException('Вы не можете закрыть чужую банковскую карту');
    }

    if (Number(card.balance) > 0) {
      throw new BadRequestException(
        `Нельзя закрыть карту с положительным балансом (${card.balance} ₽). Сначала переведите остаток.`,
      );
    }

    await this.accountRepository.delete(card.id);
    return { message: `Карта ${cardNumber} успешно закрыта и аннулирована` };
  }
}