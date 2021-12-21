import { FriendsChildCommand } from "./FriendsChildCommand";
import { Arguments } from "../../../lib/arguments/arguments";
import { LogicError } from "../../../errors";
import { DiscordIDMention } from "../../../lib/arguments/mentions/DiscordIDMention";
import { LastFMMention } from "../../../lib/arguments/mentions/LastFMMention";
import { UsernameMention } from "../../../lib/arguments/mentions/UsernameMention";
import { asyncFilter, asyncMap } from "../../../helpers";
import { SimpleMap } from "../../../helpers/types";
import { User as DiscordUser } from "discord.js";
import { User as DBUser } from "../../../database/entity/User";
import { LineConsolidator } from "../../../lib/LineConsolidator";

const args = {
  inputs: { friendUsernames: { index: { start: 0 }, join: false } },
  mentions: {
    users: { index: { start: 0 }, join: false },
    userIDs: {
      mention: new DiscordIDMention(true),
      index: { start: 0 },
      join: false,
    },
    lfmUsers: {
      mention: new LastFMMention(true),
      index: { start: 0 },
      join: false,
    },
    discordUsernames: {
      mention: new UsernameMention(true),
      index: { start: 0 },
      join: false,
    },
  },
} as const;

type FriendToAdd = string | DBUser;

export class Add extends FriendsChildCommand<typeof args> {
  idSeed = "nature aurora";

  aliases = ["addfriend", "addfriends"];

  description = "Adds friends to your friends list";
  usage = ["lfm_username, username2, ...username3", "@user"];

  arguments: Arguments = args;

  async prerun() {}

  async run() {
    const { senderUser } = await this.getMentions({ senderRequired: true });

    const { toAdd, notFound } = await this.getFriendsFromArguments();

    const alreadyFriends = [] as FriendToAdd[];

    if (!toAdd.length && !notFound.length) {
      throw new LogicError("Please specify friends to add!");
    }

    const toAddFiltered = await asyncFilter(toAdd, async (f) => {
      if (
        await this.friendsService.isAlreadyFriends(this.ctx, senderUser!, f)
      ) {
        alreadyFriends.push(f);
        return false;
      } else return true;
    });

    const addedFriends = (
      await asyncMap(toAddFiltered, async (f) => {
        try {
          return await this.friendsService.addFriend(this.ctx, senderUser!, f);
        } catch (e: any) {
          if (e.name == "LastFMError:6") notFound.push(f);
          else throw e;

          return;
        }
      })
    ).filter((u) => !!u);

    const lineConsolidator = new LineConsolidator();

    lineConsolidator.addLines(
      {
        shouldDisplay: !!addedFriends.length,
        string: `**Successfully added**: ${addedFriends
          .map((f) => (f!.friendUsername || f!.friend?.lastFMUsername!).code())
          .join(", ")}`,
      },
      {
        shouldDisplay: !!alreadyFriends.length,
        string: `**Already friends**: ${alreadyFriends.map((f) =>
          (typeof f === "string" ? f : f.lastFMUsername).code()
        )}`,
      },
      {
        shouldDisplay: !!notFound.length,
        string: `**Not found**: ${notFound.map((f) => `${f}`.code())}`,
      }
    );

    const embed = this.newEmbed()
      .setAuthor(this.generateEmbedAuthor("Add friends"))
      .setDescription(lineConsolidator.consolidate());

    await this.send(embed);
  }

  private async getFriendsFromArguments(): Promise<{
    toAdd: FriendToAdd[];
    notFound: any[];
  }> {
    const notFound = [] as any[];

    const lfmUsernames = this.parsedArguments.friendUsernames || [];
    const discordUsernames = this.parsedArguments.discordUsernames || [];
    const ids = this.parsedArguments.userIDs || [];
    const mentionedUsers = this.parsedArguments.users || [];

    const discordUsers = await asyncMap(discordUsernames, async (u) => {
      const user = await this.getDiscordUserFromUsername(u);

      if (user) return user;
      else {
        notFound.push(`u:${u}`);
        return;
      }
    });

    const lfmUsers = await asyncMap(lfmUsernames, async (u) => {
      return (
        (await this.usersService.getUserFromLastFMUsername(this.ctx, u)) || u
      );
    });

    const idMap: SimpleMap<string | DiscordUser | DBUser | { id: string }> = {};

    ids.forEach((id) => (idMap[id] = { id }));
    mentionedUsers.forEach((u) => (idMap[u.id] = u));
    discordUsers.forEach((u) => u && (idMap[u.id] = u));
    lfmUsers.forEach(
      (u) => u && (idMap[typeof u === "string" ? u : u.discordID] = u)
    );

    const toAdd = [] as Array<string | DBUser>;

    for (const friend of Object.values(idMap)) {
      if (friend instanceof DBUser) toAdd.push(friend);
      else if (typeof friend === "string") toAdd.push(friend);
      else if (friend instanceof DiscordUser || this.isID(friend)) {
        try {
          const user = await this.usersService.getUser(this.ctx, friend.id);
          if (user) toAdd.push(user);
        } catch {
          notFound.push(friend instanceof DiscordUser ? friend.tag : friend.id);
        }
      }
    }

    return { toAdd, notFound };
  }

  private isID(friend: any): friend is { id: string } {
    return !!friend.id;
  }
}
