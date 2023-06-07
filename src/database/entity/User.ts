import { DiscordAPIError, User as DiscordUser, Guild } from "discord.js";
import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { CommandAccessRoleName } from "../../lib/command/access/roles";
import { Combo } from "./Combo";
import { Crown } from "./Crown";
import { Friend } from "./Friend";
import { AlbumCard } from "./cards/AlbumCard";
import { FishyCatch } from "./fishy/FishyCatch";
import { FishyProfile } from "./fishy/FishyProfile";

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

  @OneToMany((_) => FishyCatch, (fishyCatch) => fishyCatch.owner)
  fishies!: FishyCatch[];

  @OneToMany((_) => FishyCatch, (fishyCatch) => fishyCatch.gifter)
  fishyGifts!: FishyCatch[];

  @OneToOne((_) => FishyProfile, (fishyProfile) => fishyProfile.user)
  fishyProfile!: FishyProfile;

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

  static async random(options: {
    limit: number;
    userIDs?: string[];
  }): Promise<User[]> {
    const users = await this.query(
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
}
