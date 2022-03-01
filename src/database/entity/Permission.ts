import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  Unique,
} from "typeorm";
import { User as DiscordUser, Role, Guild } from "discord.js";
import { User } from "./User";
import { GowonContext } from "../../lib/context/Context";

@Entity({ name: "permissions" })
@Unique(["serverID", "entityID", "commandID"])
export class Permission extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  entityID!: string;

  @Column()
  serverID!: string;

  @Column()
  isRoleBased!: boolean;

  @Column()
  isBlacklist!: boolean;

  @Column()
  commandID!: string;

  @Column()
  commandFriendlyName!: string;

  // devPermissions can only be modified by developers
  @Column({ default: false })
  devPermission!: boolean;

  static async toDiscordRole(ctx: GowonContext, roleID: string): Promise<Role> {
    return (await ctx.guild?.roles.fetch(roleID))!;
  }

  async toDiscordUser(guild: Guild): Promise<DiscordUser> {
    return (await User.toDiscordUser(guild, this.entityID))!;
  }

  async toDiscordRole(ctx: GowonContext): Promise<Role> {
    return (await Permission.toDiscordRole(ctx, this.entityID))!;
  }
}
