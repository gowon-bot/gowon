import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  OneToMany,
} from "typeorm";
import { Crown } from "./Crown";
import { Message, User as DiscordUser } from "discord.js";
import { Friend } from "./Friend";

@Entity({ name: "users" })
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  discordID!: string;

  @Column()
  serverID!: string;

  @Column()
  lastFMUsername!: string;

  @OneToMany((_) => Crown, (crown) => crown.user)
  crowns!: Crown[];

  @OneToMany((_) => Friend, (friend) => friend.user)
  friends!: Friend[];

  static async toDiscordUser(
    message: Message,
    discordID: string
  ): Promise<DiscordUser | undefined> {
    return (await message.guild?.members.fetch(discordID))?.user;
  }

  static async random(): Promise<User> {
    return (
      await this.query(`SELECT * FROM users ORDER BY RANDOM() LIMIT 1`)
    )[0] as User;
  }

  async toDiscordUser(message: Message): Promise<DiscordUser | undefined> {
    return await User.toDiscordUser(message, this.discordID);
  }
}
