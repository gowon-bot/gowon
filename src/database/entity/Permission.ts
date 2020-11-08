import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  Unique,
} from "typeorm";
import { User as DiscordUser, Message, Role, Guild } from "discord.js";
import { User } from "./User";

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

  static async toDiscordRole(message: Message, roleID: string): Promise<Role> {
    return (await message.guild?.roles.fetch(roleID))!;
  }

  async toDiscordUser(guild: Guild): Promise<DiscordUser> {
    return (await User.toDiscordUser(guild, this.entityID))!;
  }

  async toDiscordRole(message: Message): Promise<Role> {
    return (await Permission.toDiscordRole(message, this.entityID))!;
  }
}
