import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIsIndexedColumnToUsers1620368741072
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(
      "ALTER TABLE users ADD is_indexed boolean DEFAULT false NOT NULL;"
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query("ALTER TABLE users DROP COLUMN is_indexed;");
  }
}
