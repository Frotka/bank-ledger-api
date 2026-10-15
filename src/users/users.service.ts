import { ConflictException, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from './user.entity.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { AccountsService } from '../accounts/accounts.service.js';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly accountsService: AccountsService,
  ) {}

  /**
   * При старте приложения автоматически создаём системного администратора, если его нет
   */
  async onModuleInit() {
    const admin = await this.userRepository.findOne({ where: { email: 'admin@bank.ru' } });
    if (!admin) {
      const passwordHash = await bcrypt.hash('adminSecret2026', 10);
      await this.userRepository.save({
        firstName: 'Главный',
        lastName: 'Администратор',
        middleName: 'Банка',
        age: 30,
        birthDate: '1995-01-01',
        email: 'admin@bank.ru',
        passwordHash,
        role: UserRole.ADMIN,
      });
    }
  }

  async register(dto: CreateUserDto): Promise<User> {
    const existing = await this.userRepository.findOne({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('Клиент с таким email уже зарегистрирован');
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(dto.password, saltRounds);

    const user = this.userRepository.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      middleName: dto.middleName,
      age: dto.age,
      birthDate: dto.birthDate,
      email: dto.email,
      passwordHash,
      role: UserRole.CLIENT,
    });

    const savedUser = await this.userRepository.save(user);
    await this.accountsService.createCardForUser(savedUser.id, 50000);

    return this.findOne(savedUser.id);
  }

  /**
   * Метод администратора: исправление персональных данных клиента
   */
  async updateUser(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    Object.assign(user, dto);

    await this.userRepository.save(user);
    return this.findOne(id);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find({ relations: { cards: true } });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: { cards: true },
    });

    if (!user) {
      throw new NotFoundException(`Клиент с ID ${id} не найден`);
    }

    return user;
  }

  async findByEmailForAuth(email: string): Promise<User | null> {
    return this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .addSelect('user.refreshTokenHash')
      .where('user.email = :email', { email })
      .getOne();
  }

  async saveRefreshToken(userId: string, refreshTokenHash: string | null): Promise<void> {
    await this.userRepository.update(userId, { refreshTokenHash });
  }

  async issueAdditionalCard(userId: string) {
    await this.findOne(userId);
    return this.accountsService.createCardForUser(userId, 0);
  }
}