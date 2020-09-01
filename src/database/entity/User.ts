// Shims (required for tests)
import "./DisabledCommand";
import "./meta/CommandRun";
import "./meta/Error";
import "./Permission";
import "./Setting";

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
import { Setting } from "./Setting";
import { Settings } from "../../lib/Settings";

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

  static async random(options: {
    serverID?: string;
    limit: number;
  }): Promise<User[]> {
    let users = await this.query(
      `SELECT * FROM users ${
        options.serverID ? 'WHERE "serverID" like $2' : ""
      } ORDER BY RANDOM() LIMIT $1`,
      options.serverID ? [options.limit, options.serverID] : [options.limit]
    );

    return users as User[];
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

  async isCrownBanned(message: Message): Promise<boolean> {
    return GowonService.getInstance().isUserCrownBanned(
      message.guild!,
      this.discordID
    );
  }

  async isOptedOut(message: Message): Promise<boolean> {
    let setting = await Setting.getByName(
      Settings.OptedOut,
      message.guild!.id,
      this.discordID
    );

    return !!setting;
  }
}
