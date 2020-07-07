import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  Unique,
} from "typeorm";
import { User as DiscordUser, Message, Role } from "discord.js";
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

  async toDiscordUser(message: Message): Promise<DiscordUser> {
    return (await User.toDiscordUser(message, this.entityID))!;
  }

  async toDiscordRole(message: Message): Promise<Role> {
    return (await message.guild?.roles.fetch(this.entityID))!;
  }
}
