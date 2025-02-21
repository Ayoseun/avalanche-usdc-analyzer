// migrations/001-init-schema.ts
import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitSchema1645567890123 implements MigrationInterface {
  name = 'InitSchema1645567890123';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "account" (
        "address" character varying NOT NULL,
        "totalVolumeUSDC" decimal(36,6) NOT NULL DEFAULT '0',
        "totalTransactions" integer NOT NULL DEFAULT '0',
        "lastBalance" decimal(36,6) NOT NULL DEFAULT '0',
        "firstSeen" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "lastActive" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "PK_account_address" PRIMARY KEY ("address")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "transaction" (
        "txHash" character varying NOT NULL,
        "blockNumber" integer NOT NULL,
        "blockTimestamp" TIMESTAMP NOT NULL,
        "from" character varying NOT NULL,
        "to" character varying NOT NULL,
        "amount" decimal(36,6) NOT NULL,
        "gasUsed" decimal(10,2) NOT NULL,
        "gasPrice" decimal(36,18) NOT NULL,
        "isError" boolean NOT NULL DEFAULT false,
        CONSTRAINT "PK_transaction_txHash" PRIMARY KEY ("txHash"),
        CONSTRAINT "FK_transaction_from" FOREIGN KEY ("from") REFERENCES "account"("address"),
        CONSTRAINT "FK_transaction_to" FOREIGN KEY ("to") REFERENCES "account"("address")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_transaction_blockTimestamp" ON "transaction"("blockTimestamp")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_transaction_from" ON "transaction"("from")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_transaction_to" ON "transaction"("to")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_transaction_to"`);
    await queryRunner.query(`DROP INDEX "IDX_transaction_from"`);
    await queryRunner.query(`DROP INDEX "IDX_transaction_blockTimestamp"`);
    await queryRunner.query(`DROP TABLE "transaction"`);
    await queryRunner.query(`DROP TABLE "account"`);
  }
}