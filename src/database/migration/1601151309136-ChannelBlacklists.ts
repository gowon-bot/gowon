import {MigrationInterface, QueryRunner} from "typeorm";

export class channelblacklists1601151309136 implements MigrationInterface {
    name = 'channelblacklists1601151309136'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "channel_blacklists" ("id" SERIAL NOT NULL, "commandID" character varying NOT NULL, "serverID" character varying NOT NULL, "channelID" character varying NOT NULL, CONSTRAINT "PK_568a35b108f1143c8579b637e78" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "crowns" ADD CONSTRAINT "FK_0bde66d70f61131ef676eb4e402" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "crowns" DROP CONSTRAINT "FK_0bde66d70f61131ef676eb4e402"`);
        await queryRunner.query(`DROP TABLE "channel_blacklists"`);
    }

}
