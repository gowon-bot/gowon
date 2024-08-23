import { MigrationInterface, QueryRunner, TableForeignKey } from "typeorm";

export class InitialMigration1599547381206 implements MigrationInterface {
  name = "InitialMigration1599547381206";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "artist_redirects" ("id" SERIAL NOT NULL, "from" character varying NOT NULL, "to" character varying NOT NULL, CONSTRAINT "PK_f883a9716bf39ca7951095522b1" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "disabled_commands" ("id" SERIAL NOT NULL, "commandID" character varying NOT NULL, "serverID" character varying NOT NULL, "commandFriendlyName" character varying NOT NULL, CONSTRAINT "PK_90fbf7a1fdf7fcf35da7168ef7e" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "command_runs" ("id" SERIAL NOT NULL, "commandID" character varying NOT NULL, "channelID" character varying NOT NULL, "serverID" character varying NOT NULL, "userID" character varying NOT NULL, "runAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_b7e94597a3f02016a167e2cdd2f" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "errors" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "occurrenceCount" integer NOT NULL, CONSTRAINT "PK_f1ab2df89a11cd21f48ff90febb" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "permissions" ("id" SERIAL NOT NULL, "entityID" character varying NOT NULL, "serverID" character varying NOT NULL, "isRoleBased" boolean NOT NULL, "isBlacklist" boolean NOT NULL, "commandID" character varying NOT NULL, "commandFriendlyName" character varying NOT NULL, CONSTRAINT "UQ_aebec45810930718328d1617776" UNIQUE ("serverID", "entityID", "commandID"), CONSTRAINT "PK_920331560282b8bd21bb02290df" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "settings" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "scope" character varying, "secondaryScope" character varying, "value" character varying NOT NULL, CONSTRAINT "PK_0669fe20e252eb692bf4d344975" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "friends" ("id" SERIAL NOT NULL, "serverID" character varying NOT NULL, "friendUsername" character varying NOT NULL, "userId" integer, CONSTRAINT "PK_65e1b06a9f379ee5255054021e1" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "crown_bans" ("id" SERIAL NOT NULL, "serverID" character varying NOT NULL, "userId" integer, CONSTRAINT "REL_235c9f77be3f6196144648008a" UNIQUE ("userId"), CONSTRAINT "PK_29878dcf67d80b4c4619fed30f9" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "users" ("id" SERIAL NOT NULL, "discordID" character varying NOT NULL, "serverID" character varying NOT NULL, "lastFMUsername" character varying NOT NULL, CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "crown_events" ("id" SERIAL NOT NULL, "event" character varying NOT NULL, "snatchedEvent" character varying, "oldCrown" text, "newCrown" text NOT NULL, "perpetuatorDiscordID" character varying NOT NULL, "perpetuatorUsername" character varying NOT NULL, "secondaryUserDiscordID" character varying, "secondaryUsername" character varying, "happenedAt" TIMESTAMP NOT NULL DEFAULT now(), "crownId" integer, CONSTRAINT "PK_08db08f7d48fdcbcb8269b01137" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "crowns" ("id" SERIAL NOT NULL, "serverID" character varying NOT NULL, "artistName" character varying NOT NULL, "plays" integer NOT NULL, "version" integer NOT NULL, "lastStolen" TIMESTAMP NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "userId" integer, CONSTRAINT "PK_a6754f73b303226836d15e01334" PRIMARY KEY ("id"))`
    );

    queryRunner.createForeignKey(
      "friends",
      new TableForeignKey({
        columnNames: ["userId"],
        referencedTableName: "users",
        referencedColumnNames: ["id"],
      })
    );

    queryRunner.createForeignKey(
      "crown_bans",
      new TableForeignKey({
        columnNames: ["userId"],
        referencedTableName: "users",
        referencedColumnNames: ["id"],
      })
    );

    queryRunner.createForeignKey(
      "crown_events",
      new TableForeignKey({
        columnNames: ["crownId"],
        referencedTableName: "crowns",
        referencedColumnNames: ["id"],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "crowns"`);
    await queryRunner.query(`DROP TABLE "crown_events"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TABLE "crown_bans"`);
    await queryRunner.query(`DROP TABLE "friends"`);
    await queryRunner.query(`DROP TABLE "settings"`);
    await queryRunner.query(`DROP TABLE "permissions"`);
    await queryRunner.query(`DROP TABLE "errors"`);
    await queryRunner.query(`DROP TABLE "command_runs"`);
    await queryRunner.query(`DROP TABLE "disabled_commands"`);
    await queryRunner.query(`DROP TABLE "artist_redirects"`);
  }
}
