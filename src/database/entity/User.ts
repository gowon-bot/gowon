import {
  DiscordAPIError,
  Guild,
  GuildMember,
  User as DiscordUser,
} from "discord.js";
import gql from "graphql-tag";
import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { userHasRole } from "../../helpers/discord";
import { CommandAccessRoleName } from "../../lib/command/access/roles";
import { GowonContext } from "../../lib/context/Context";
import { Logger } from "../../lib/Logger";
import { SettingsService } from "../../lib/settings/SettingsService";
import { GowonService } from "../../services/GowonService";
import { MirrorballService } from "../../services/mirrorball/MirrorballService";
import { ServiceRegistry } from "../../services/ServicesRegistry";
import { AlbumCard } from "./cards/AlbumCard";
import { Combo } from "./Combo";
import { Crown } from "./Crown";
import { Friend } from "./Friend";

@Entity({ name: "users" })
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  discordID!: string;

  // Deprecated
  @Column({ nullable: true })
  twitterID!: string;

  @Column()
  lastFMUsername!: string;

  @Column({ nullable: true })
  discordAuthCode?: string;

  @Column({ nullable: true })
  spotifyRefreshToken?: string;

  @Column({ default: false })
  isIndexed!: boolean;

  @Column({ nullable: true })
  lastFMSession?: string;

  @Column({ default: false })
  isPatron!: boolean;

  @OneToMany((_) => Crown, (crown) => crown.user)
  crowns!: Crown[];

  @OneToMany((_) => Friend, (friend) => friend.user)
  friends!: Friend[];

  @OneToMany((_) => Combo, (combo) => combo.user)
  combos!: Combo[];

  @OneToMany((_) => AlbumCard, (albumCard) => albumCard.owner)
  albumCards!: AlbumCard[];

  @Column("simple-array", { nullable: true })
  roles?: CommandAccessRoleName[];

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
    ctx: GowonContext,
    discordID?: string
  ): Promise<boolean> {
    if (!discordID) {
      return false;
    }

    try {
      return !!(await ctx.guild?.members.fetch(discordID));
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

  async asGuildMember(ctx: GowonContext): Promise<GuildMember | undefined> {
    try {
      return await ctx.guild?.members.fetch(this.discordID);
    } catch (e) {
      if (!(e instanceof DiscordAPIError)) throw e;
      return;
    }
  }

  async inPurgatory(ctx: GowonContext): Promise<boolean> {
    return userHasRole(
      await this.asGuildMember(ctx),
      await ServiceRegistry.get(GowonService).getPurgatoryRole(ctx.guild!)
    );
  }

  async inactive(ctx: GowonContext): Promise<boolean> {
    return userHasRole(
      await this.asGuildMember(ctx),
      await ServiceRegistry.get(GowonService).getInactiveRole(ctx.guild!)
    );
  }

  async isCrownBanned(ctx: GowonContext): Promise<boolean> {
    return ServiceRegistry.get(GowonService).isUserCrownBanned(
      ctx.guild!,
      this.discordID
    );
  }

  async isOptedOut(ctx: GowonContext): Promise<boolean> {
    const settingsService = ServiceRegistry.get(SettingsService);

    const setting = settingsService.get("optedOut", {
      guildID: ctx.guild!.id,
      userID: this.discordID,
    });

    return !!setting;
  }

  async canClaimCrowns(ctx: GowonContext): Promise<boolean> {
    return (
      !(await this.inPurgatory(ctx)) &&
      !(await this.inactive(ctx)) &&
      !(await this.isCrownBanned(ctx)) &&
      !(await this.isOptedOut(ctx))
    );
  }

  async mirrorballUpdate(ctx: GowonContext): Promise<void> {
    const mirrorballService = ServiceRegistry.get(MirrorballService);

    Logger.log("User", `updating ${this.discordID}`);

    if (!this.isIndexed) {
      return;
    }

    mirrorballService.mutate(
      ctx,
      gql`
        mutation Update($discordID: String!) {
          update(user: { discordID: $discordID }) {
            success
          }
        }
      `,
      { discordID: this.discordID }
    );
  }
}
