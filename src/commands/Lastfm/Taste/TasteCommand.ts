import { MessageEmbed } from "discord.js";
import { Arguments } from "../../../lib/arguments/arguments";
import {
  Taste as TasteType,
  TasteArtist,
} from "../../../lib/calculators/TasteCalculator";
import { isNumeric, StringPadder } from "../../../helpers";
import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { LastFMPeriod } from "../../../services/LastFM/LastFMService.types";
import { Paginator } from "../../../lib/Paginator";
import { LastFMMention } from "../../../lib/arguments/mentions/LastFMMention";
import { DiscordIDMention } from "../../../lib/arguments/mentions/DiscordIDMention";
import { LogicError } from "../../../errors";
import { DurationParser } from "../../../lib/DurationParser";
import { toInt } from "../../../helpers/lastFM";
import { displayNumber } from "../../../lib/views/displays";

export const tasteMentions = {
  user: { index: 0 },
  user2: { index: 1 },
  lfmUser: {
    index: 0,
    mention: new LastFMMention(true),
  },
  lfmUser2: {
    index: 1,
    mention: new LastFMMention(true),
  },
  userID: {
    index: 0,
    mention: new DiscordIDMention(true),
  },
  userID2: {
    index: 1,
    mention: new DiscordIDMention(true),
  },
} as const;

export abstract class TasteCommand<
  T extends Arguments = { mentions: typeof tasteMentions }
> extends LastFMBaseCommand<T> {
  subcategory = "taste";

  durationParser = new DurationParser();

  arguments: Arguments = { mentions: tasteMentions };

  protected async getUsernames(): Promise<[string, string]> {
    let usernames: string[] = [];

    // The following code is for parsing users
    // it essentially checks through the following arguments, checking if each one exists
    // if it does, it adds it to the usernames list (after two it stops checking)
    // if there's only one username, it makes the first user the sender, then the second user the mentioned user
    // this is because the order of the users matters for display
    for (let argName of [
      "user",
      "user2",
      "userID",
      "userID2",
      "lfmUser",
      "lfmUser2",
      "username",
      "username2",
    ]) {
      const parsedArguments = this.parsedArguments as any;

      if (usernames.length < 2 && parsedArguments[argName]) {
        let username: string | undefined;

        if (argName === "user" || argName === "user2") {
          username = await this.usersService.getUsername(
            parsedArguments[argName].id
          );
        } else if (argName === "userID" || argName === "userID2") {
          username = await this.usersService.getUsername(
            parsedArguments[argName]
          );
        } else if (argName === "username" || argName === "username2") {
          const usernameArgument = parsedArguments[argName] as string;

          if (
            !this.durationParser.isDuration(usernameArgument) &&
            !isNumeric(usernameArgument)
          ) {
            username = usernameArgument;
          }
        } else if (argName === "lfmUser" || argName === "lfmUser2") {
          username = parsedArguments[argName] as string;
        } else {
          throw new LogicError("please enter a user to compare your taste to!");
        }

        if (username) usernames.push(username);
      }
    }

    let [userOneUsername, userTwoUsername] = usernames;

    if (!userTwoUsername) {
      let senderUsername = await this.usersService.getUsername(this.author.id);

      userTwoUsername = userOneUsername;
      userOneUsername = senderUsername;
    }

    if (!userOneUsername || !userTwoUsername)
      throw new LogicError("please enter a user to compare your taste to!");

    return [userOneUsername, userTwoUsername];
  }

  protected getPaginators(usernameOne: string, usernameTwo: string) {
    let artistAmount = (this.parsedArguments as any).artistAmount as number,
      timePeriod = ((this.parsedArguments as any).timePeriod ||
        "overall") as LastFMPeriod;

    let maxPages = artistAmount > 1000 ? 2 : 1;
    let params = {
      limit: artistAmount > 1000 ? Math.ceil(artistAmount / 2) : artistAmount,
      period: timePeriod,
    };

    let senderPaginator = new Paginator(
      this.lastFMService.topArtists.bind(this.lastFMService),
      maxPages,
      { ...params, username: usernameOne }
    );

    let mentionedPaginator = new Paginator(
      this.lastFMService.topArtists.bind(this.lastFMService),
      maxPages,
      { ...params, username: usernameTwo }
    );

    return [senderPaginator, mentionedPaginator] as const;
  }

  protected generateTable(
    userOneUsername: string,
    userTwoUsername: string,
    artists: TasteArtist[]
  ): string {
    let padder = new StringPadder((val) => `${val}`);
    let maxArtists = 20;

    let paddedPlays1 = padder.generatedPaddedList(
      [
        userOneUsername,
        ...artists.slice(0, maxArtists).map((a) => a.user1plays),
      ],
      true
    );
    let paddedPlays2 = padder.generatedPaddedList([
      userTwoUsername,
      ...artists.slice(0, maxArtists).map((a) => a.user2plays),
    ]);
    let longestArtist = padder.maxLength(
      artists.slice(0, maxArtists).map((a) => a.name)
    );

    let headers = [
      `${paddedPlays1[0]}   ${paddedPlays2[0]}   Artist`,
      "=".repeat(
        `${paddedPlays1[0]}   ${paddedPlays2[0]}   `.length + longestArtist
      ),
    ];

    let table = artists
      .slice(0, maxArtists)
      .map(
        (a, idx) =>
          `${paddedPlays1[idx + 1]} ${
            toInt(paddedPlays1[idx + 1].trim()) ===
            toInt(paddedPlays2[idx + 1].trim())
              ? "•"
              : toInt(paddedPlays1[idx + 1].trim()) >
                toInt(paddedPlays2[idx + 1].trim())
              ? ">"
              : "<"
          } ${paddedPlays2[idx + 1]}   ${a.name}`
      );

    return `\`\`\`\n${[...headers, ...table].join("\n")}\n\`\`\``;
  }

  protected generateEmbed(taste: TasteType, embed: MessageEmbed) {
    embed = embed.addFields(
      taste.artists.slice(0, 12).map((ta) => ({
        name: ta.name,
        value: `${displayNumber(ta.user1plays, "play")} - ${displayNumber(
          ta.user2plays,
          "play"
        )}`,
        inline: true,
      }))
    );
  }
}
