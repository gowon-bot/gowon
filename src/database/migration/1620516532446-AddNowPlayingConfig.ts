import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNowPlayingConfig1620516532446 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query("CREATE EXTENSION IF NOT EXISTS citext;");
    queryRunner.query(
      `CREATE TABLE artist_aliases ( "id" SERIAL NOT NULL, "artist_name" text, "alias" citext);`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query("DROP TABLE artist_aliases;");
    queryRunner.query("DROP EXTENSION citext;");
  }
}
