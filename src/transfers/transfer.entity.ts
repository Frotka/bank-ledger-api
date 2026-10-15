import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  type Relation,
} from 'typeorm';
import type { Account } from '../accounts/account.entity.js';

export enum TransferStatus {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

@Entity('transfers')
export class Transfer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'decimal',
    precision: 15,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  amount: number;

  @Column({
    type: 'enum',
    enum: TransferStatus,
    default: TransferStatus.SUCCESS,
  })
  status: TransferStatus;

  @ManyToOne('Account', 'outgoingTransfers', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'fromAccountId' })
  fromAccount: Relation<Account>;

  @Column({ type: 'uuid' })
  fromAccountId: string;

  @ManyToOne('Account', 'incomingTransfers', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'toAccountId' })
  toAccount: Relation<Account>;

  @Column({ type: 'uuid' })
  toAccountId: string;

  @CreateDateColumn()
  createdAt: Date;
}