import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BaseEntity,
  OneToMany,
} from "typeorm";
import { Crown } from "./Crown";
import {
  DiscordAPIError,
  GuildMember,
  Message,
  User as DiscordUser,
} from "discord.js";
import { Friend } from "./Friend";
import { userHasRole } from "../../helpers/discord";
import { GowonService } from "../../services/GowonService";

// Shims (required for tests)
import "./DisabledCommand";
import "./meta/CommandRun";
import "./meta/Error";
import "./Permission";
import "./Setting";

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
    try {
      return (await message.guild?.members.fetch(discordID))?.user;
    } catch {
      return;
    }
  }

  static async stillInServer(
    message: Message,
    discordID: string
  ): Promise<boolean> {
    try {
      return !!(await message.guild?.members.fetch(discordID));
    } catch {
      return false;
    }
  }

  static async random(): Promise<User> {
    return (
      await this.query(`SELECT * FROM users ORDER BY RANDOM() LIMIT 1`)
    )[0] as User;
  }

  async toDiscordUser(message: Message): Promise<DiscordUser | undefined> {
    try {
      return await User.toDiscordUser(message, this.discordID);
    } catch (e) {
      if (!(e instanceof DiscordAPIError)) throw e;
      return;
    }
  }

  async asGuildMember(message: Message): Promise<GuildMember | undefined> {
    try {
      return await message.guild?.members.fetch(this.discordID);
    } catch (e) {
      if (!(e instanceof DiscordAPIError)) throw e;
      return;
    }
  }

  async inPurgatory(message: Message): Promise<boolean> {
    return userHasRole(
      await this.asGuildMember(message),
      await GowonService.getInstance().getPurgatoryRole(message.guild!)
    );
  }

  async inactive(message: Message): Promise<boolean> {
    return userHasRole(
      await this.asGuildMember(message),
      await GowonService.getInstance().getInactiveRole(message.guild!)
    );
  }
}
