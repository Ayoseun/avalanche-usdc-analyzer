// entities/account.entity.ts
import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { Transaction } from './transaction.entity';

@Entity()
export class Account {
  @PrimaryColumn()
  address: string;

  @Column({ type: 'decimal', precision: 36, scale: 6, default: 0 })
  totalVolumeUSDC: number;

  @Column({ type: 'int', default: 0 })
  totalTransactions: number;

  @Column({ type: 'decimal', precision: 36, scale: 6, default: 0 })
  lastBalance: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  firstSeen: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  lastActive: Date;

  @OneToMany(() => Transaction, transaction => transaction.from)
  sentTransactions: Transaction[];

  @OneToMany(() => Transaction, transaction => transaction.to)
  receivedTransactions: Transaction[];
}