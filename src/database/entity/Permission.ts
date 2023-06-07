import {
  BaseEntity,
  Column,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
} from "typeorm";
import { SimpleMap } from "../../helpers/types";
import {
  PermissionCacheKey,
  generateCacheKey,
} from "../../lib/permissions/PermissionsCache";
import { PermissionQuery } from "../../lib/permissions/PermissionsCacheService";

export enum PermissionType {
  user = "user",
  guildMember = "guildmember",
  role = "role",
  guild = "guild",
  channel = "channel",
  bot = "bot",
}

@Entity({ name: "new_permissions" })
@Unique(["type", "entityID", "commandID"])
export class Permission extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "enum", enum: PermissionType })
  type!: PermissionType;

  // If type = user or type = guildMember, then this is the user ID
  // If type = role, then this is the role ID
  // If type = guild, then this is the guild ID
  // If type = channel, then this is the channel ID
  // if type = bot, then this is null
  @Column({ nullable: true })
  entityID?: string;

  @Column()
  commandID!: string;

  // Used for viewing permissions
  @Column({ nullable: true })
  guildID?: string;

  // If allow is true, this permissions *allows* instead of blocks
  @Column({ default: false })
  allow!: boolean;

  public asCacheKey(): PermissionCacheKey {
    return generateCacheKey(this.type, this.commandID, this.entityID);
  }

  // Static methods
  static async getFromQueries(
    queries: PermissionQuery[],
    guildID?: string
  ): Promise<Permission[]> {
    const queryBuilder = Permission.createQueryBuilder();

    for (const query of queries) {
      const where = {} as SimpleMap;

      if (guildID) where.guildID = guildID;
      if (query.entityID) where.entityID = query.entityID;
      if (query.type) where.type = query.type;
      if (query.commandID) where.commandID = query.commandID;

      queryBuilder.orWhere(where);
    }

    return await queryBuilder.getMany();
  }
}
