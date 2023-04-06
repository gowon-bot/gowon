import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { code } from "../../helpers/discord";
import { LastfmLinks } from "../../helpers/lastfm/LastfmLinks";
import { displayLink } from "../../lib/views/displays";
import { User } from "./User";

@Entity({ name: "friends" })
export class Friend extends BaseEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne((_) => User, (user) => user.friends, { eager: true })
  user!: User;

  @ManyToOne((_) => User, { eager: true, nullable: true })
  friend?: User;

  @Column({ nullable: true })
  friendUsername?: string;

  @Column({ nullable: true })
  alias?: string;

  public display(): string {
    return displayLink(
      this.alias
        ? this.alias
        : this.getUsername()
        ? code(this.getUsername())
        : "",
      LastfmLinks.userPage(this.getUsername()),
      false
    );
  }

  public getUsername(): string {
    return (this.friendUsername || this.friend?.lastFMUsername) ?? "";
  }

  public getDiscordID(): string | undefined {
    return this.friend?.discordID;
  }
}
