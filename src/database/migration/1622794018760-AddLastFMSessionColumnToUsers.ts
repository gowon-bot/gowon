import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLastFMSessionColumnToUsers1622794018760
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("ALTER TABLE users ADD last_fm_session text;");
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query("ALTER TABLE users DROP COLUMN last_fm_session;");
  }
}
