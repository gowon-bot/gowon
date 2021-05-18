import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNowPlayingConfig1620516532446 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(
      `CREATE TABLE now_playing_config ( "id" SERIAL NOT NULL, "userId" integer UNIQUE REFERENCES "users"(id), "config" text[] `
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query("DROP TABLE now_playing_config;");
  }
}
