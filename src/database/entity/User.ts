import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  OneToMany,
} from "typeorm";
import { Crown } from "./Crown";
import { Message, User as DiscordUser } from "discord.js";

@Entity({ name: "users" })
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  discordID!: string;

  @Column()
  lastFMUsername!: string;

  @OneToMany((type) => Crown, (crown) => crown.user)
  crowns!: Crown[];

  static async toDiscordUser(
    message: Message,
    discordID: string
  ): Promise<DiscordUser | undefined> {
    return (await message.guild?.members.fetch(discordID))?.user;
  }

  async toDiscordUser(message: Message): Promise<DiscordUser | undefined> {
    return await User.toDiscordUser(message, this.discordID);
  }
}
