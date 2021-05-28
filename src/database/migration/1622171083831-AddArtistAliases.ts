import { MigrationInterface, QueryRunner } from "typeorm";

export class AddArtistAliases1622171083831 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(
      `CREATE TABLE artist_aliases ( "id" SERIAL NOT NULL, "userId" integer UNIQUE REFERENCES "users"(id), "config" text[] `
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
