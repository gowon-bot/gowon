import { MigrationInterface, QueryRunner } from "typeorm";

export class artistCrownBans1604274206593 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "artist_crown_bans" ("id" SERIAL NOT NULL, "serverID" character varying NOT NULL, "artistName" character varying NOT NULL, CONSTRAINT "PK_568a35b108f1143c8579b637e78" PRIMARY KEY ("id"))`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "artist_crown_bans"`);
  }
}
