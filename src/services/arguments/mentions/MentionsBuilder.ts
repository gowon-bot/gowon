import { User as DiscordUser } from "discord.js";
import { User as DBUser } from "../../../database/entity/User";
import { Perspective } from "../../../lib/Perspective";
import { Requestable } from "../../LastFM/LastFMAPIService";
import { MirrorballUser } from "../../mirrorball/MirrorballTypes";
import {
  GetMentionsOptions,
  Mentions,
  MentionsUser,
  PartialMentions,
  Requestables,
} from "./MentionsService.types";

export class MentionsBuilder {
  private mentions: {
    sender: Partial<PartialMentions>;
    mentioned: Partial<PartialMentions>;
  } = { sender: {}, mentioned: {} };

  addDiscordUser(to: MentionsUser, discordUser: DiscordUser | undefined): void {
    this.mentions[to].discordUser = discordUser;
  }

  addUserID(to: MentionsUser, id: string | undefined): void {
    this.mentions[to].discordID = id;
  }

  addDBUser(to: MentionsUser, dbUser: DBUser | undefined): void {
    this.mentions[to].dbUser = dbUser;
  }

  addLfmUsername(to: MentionsUser, username: string | undefined): void {
    this.mentions[to].username = username;
  }

  addMirrorballUser(to: MentionsUser, user: MirrorballUser | undefined): void {
    this.mentions[to].mirrorballUser = user;
  }

  getDiscordUser(from?: MentionsUser): DiscordUser | undefined {
    return this.get(from, "discordUser") as DiscordUser | undefined;
  }

  getDiscordID(from?: MentionsUser): string | undefined {
    return (
      (this.get(from, "discordID") as string | undefined) ||
      this.getDBUser(from)?.discordID ||
      this.getDiscordUser(from)?.id
    );
  }

  getDBUser(from?: MentionsUser): DBUser | undefined {
    return this.get(from, "dbUser") as DBUser | undefined;
  }

  getLfmUsername(from?: MentionsUser): string | undefined {
    return (
      (this.get(from, "username") as string | undefined) ||
      this.getDBUser(from)?.lastFMUsername
    );
  }

  getMirrorballUser(from?: MentionsUser): MirrorballUser | undefined {
    return this.get(from, "mirrorballUser") as MirrorballUser | undefined;
  }

  build(options: GetMentionsOptions, requestables: Requestables): Mentions {
    const perspective = Perspective.perspective(
      this.getLfmUsername("sender") || "<no user>",
      this.getLfmUsername("mentioned"),
      options.perspectiveAsCode
    );

    const baseMentions = {
      senderUser: this.getDBUser("sender"),
      senderMirrorballUser: this.getMirrorballUser("sender"),
      mentionedUsername: this.getLfmUsername("mentioned"),
      mentionedDBUser: this.getDBUser("mentioned"),
      perspective,
      ...requestables,
    };

    if (this.hasAnyMentioned()) {
      return {
        ...baseMentions,
        dbUser: this.getDBUser("mentioned")!,
        username: this.getLfmUsername("mentioned")!,
        discordUser: this.getDiscordUser("mentioned"),
        mirrorballUser: this.getMirrorballUser("mentioned"),
      };
    } else {
      return {
        ...baseMentions,
        dbUser: this.getDBUser("sender")!,
        username: this.getLfmUsername("sender")!,
        discordUser: this.getDiscordUser("sender"),
        mirrorballUser: this.getMirrorballUser("sender"),
      };
    }
  }

  hasAnyMentioned(): boolean {
    return Boolean(
      this.mentions.mentioned.dbUser ||
        this.mentions.mentioned.discordID ||
        this.mentions.mentioned.discordUser ||
        this.mentions.mentioned.mirrorballUser ||
        this.mentions.mentioned.username
    );
  }

  buildRequestables(): Requestables | undefined {
    const senderUser = this.getDBUser("sender");
    const mentionedUser = this.getDBUser("mentioned");
    const mentionedUsername = this.getLfmUsername("mentioned");

    if (!senderUser && !mentionedUsername && !mentionedUser) {
      return undefined;
    }

    const requestables = {} as Partial<Requestables>;

    const senderRequestable = buildRequestable(
      senderUser?.lastFMUsername!,
      senderUser
    );

    requestables.senderRequestable = senderRequestable.requestable;
    requestables.senderUsername = senderRequestable.username;

    if (mentionedUser || mentionedUsername) {
      const requestable = buildRequestable(mentionedUsername!, mentionedUser);

      requestables.requestable = requestable.requestable;
      requestables.username = requestable.username;
    } else {
      requestables.requestable = senderRequestable.requestable;
      requestables.username = senderRequestable.username;
    }

    return requestables as Requestables;
  }

  private get(
    from: MentionsUser | undefined,
    key: keyof PartialMentions
  ): unknown {
    if (from) {
      return this.mentions[from][key];
    } else {
      return this.mentions["mentioned"][key] || this.mentions["sender"][key];
    }
  }
}

export function buildRequestable(
  username: string,
  user?: DBUser
): { requestable: Requestable; username: string } {
  if (user?.lastFMSession && user?.lastFMUsername) {
    return {
      username,
      requestable: {
        username: user.lastFMUsername,
        session: user.lastFMSession,
      },
    };
  } else {
    return { requestable: username, username };
  }
}
