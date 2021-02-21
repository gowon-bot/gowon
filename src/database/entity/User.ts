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
  Guild,
  GuildMember,
  Message,
  User as DiscordUser,
} from "discord.js";
import { Friend } from "./Friend";
import { userHasRole } from "../../helpers/discord";
import { GowonService } from "../../services/GowonService";

@Entity({ name: "users" })
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  discordID!: string;

  @Column()
  lastFMUsername!: string;

  @Column({ nullable: true })
  discordAuthCode?: string;

  @OneToMany((_) => Crown, (crown) => crown.user)
  crowns!: Crown[];

  @OneToMany((_) => Friend, (friend) => friend.user)
  friends!: Friend[];

  static async toDiscordUser(
    guild: Guild,
    discordID: string
  ): Promise<DiscordUser | undefined> {
    try {
      return (await guild.members.fetch(discordID))?.user;
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
    limit: number;
    userIDs?: string[];
  }): Promise<User[]> {
    let users = await this.query(
      `SELECT * FROM users${
        options.userIDs?.length ? ` WHERE "discordID" = ANY ($2)` : ""
      } ORDER BY RANDOM() LIMIT $1`,
      options.userIDs?.length
        ? [options.limit, options.userIDs]
        : [options.limit]
    );

    return users as User[];
  }

  async toDiscordUser(guild: Guild): Promise<DiscordUser | undefined> {
    try {
      return await User.toDiscordUser(guild, this.discordID);
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
    const settingsManager = GowonService.getInstance().settingsManager;

    const setting = settingsManager.get("optedOut", {
      guildID: message.guild!.id,
      userID: this.discordID,
    });

    return !!setting;
  }
}
