// // src/modules/avalanche/transfer.entity.ts
// import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';

// @Entity()
// export class TransferEntity {
//   @PrimaryGeneratedColumn()
//   id: number;

//   @Column()
//   @Index()
//   from: string;

//   @Column()
//   @Index()
//   to: string;

//   @Column('numeric')
//   value: string;

//   @Column()
//   transactionHash: string;

//   @Column()
//   blockNumber: number;

//   @Column('timestamp')
//   @Index()
//   timestamp: Date;
// }



// entities/transaction.entity.ts
import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Account } from './account.entity';

@Entity()
@Index(['blockTimestamp']) // Index for time-based queries
@Index(['from']) // Index for sender queries
@Index(['to']) // Index for receiver queries
export class Transaction {
  @PrimaryColumn()
  txHash: string;

  @Column()
  blockNumber: number;

  @Column()
  blockTimestamp: Date;

  @ManyToOne(() => Account, account => account.sentTransactions)
  @JoinColumn({ name: 'from' })
  from: Account;

  @ManyToOne(() => Account, account => account.receivedTransactions)
  @JoinColumn({ name: 'to' })
  to: Account;

  @Column({ type: 'decimal', precision: 36, scale: 6 })
  amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  gasUsed: number;

  @Column({ type: 'decimal', precision: 36, scale: 18 })
  gasPrice: number;

  @Column({ default: false })
  isError: boolean;
}
