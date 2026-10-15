import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  type Relation,
} from 'typeorm';
import type { User } from '../users/user.entity.js';
import type { Transfer } from '../transfers/transfer.entity.js';

@Entity('accounts')
export class Account {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * 16-значный номер банковской карты
   */
  @Column({ unique: true, length: 16 })
  cardNumber: string;

  /**
   * Баланс карты (по умолчанию 50 000 руб. для бета-теста)
   */
  @Column({
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: 50000.0,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  balance: number;

  @Column({ default: 'RUB' })
  currency: string;

  /**
   * Связь со счётом владельца
   */
  @ManyToOne('User', 'cards', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: Relation<User>;

  @Column({ type: 'uuid' })
  userId: string;

  @OneToMany('Transfer', 'fromAccount')
  outgoingTransfers: Relation<Transfer>[];

  @OneToMany('Transfer', 'toAccount')
  incomingTransfers: Relation<Transfer>[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}