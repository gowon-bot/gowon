import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveServerIDFromAndAddDiscordAuthCodeToUser1599713196330
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'AlTER TABLE users ADD COLUMN "discordAuthCode" VARCHAR'
    );
    await queryRunner.query('AlTER TABLE users DROP COLUMN "serverID"');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('AlTER TABLE users ADD COLUMN "serverID" VARCHAR');
    await queryRunner.query('AlTER TABLE users DROP COLUMN "discordAuthCode"');
  }
}
