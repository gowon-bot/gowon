import { MessageEmbed } from "discord.js";
import {
  Taste as TasteType,
  TasteArtist,
} from "../../../lib/calculators/TasteCalculator";
import { isNumeric, StringPadder } from "../../../helpers";
import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { LastFMPeriod } from "../../../services/LastFM/LastFMService.types";
import { Paginator } from "../../../lib/paginators/Paginator";
import { LogicError } from "../../../errors/errors";
import { DurationParser } from "../../../lib/context/arguments/parsers/DurationParser";
import { toInt } from "../../../helpers/lastFM";
import { displayNumber } from "../../../lib/views/displays";
import { TimeRange } from "../../../lib/timeAndDate/TimeRange";
import { NamedRangeParser } from "../../../lib/context/arguments/parsers/NamedRangeParser";
import { LastFMMention } from "../../../lib/context/arguments/mentionTypes/LastFMMention";
import { DiscordIDMention } from "../../../lib/context/arguments/mentionTypes/DiscordIDMention";
import { UserStringArgument } from "../../../lib/context/arguments/argumentTypes/UserStringArgument";
import { DiscordUserArgument } from "../../../lib/context/arguments/argumentTypes/discord/DiscordUserArgument";

export const tasteArgs = {
  user: new DiscordUserArgument({
    index: 0,
    description: "The user to compare with",
  }),
  user2: new DiscordUserArgument({
    index: 1,
    description: "The other user to compare (defaults to you)",
  }),
  lastfmUsername: new UserStringArgument({
    index: 0,
    mention: new LastFMMention(),
    description: "The Last.fm username to compare with",
    slashCommandOption: false,
  }),
  lastfmUsername2: new UserStringArgument({
    index: 1,
    mention: new LastFMMention(),
    description: "The other Last.fm username to compare (defaults to you)",
    slashCommandOption: false,
  }),
  userID: new UserStringArgument({
    index: 0,
    mention: new DiscordIDMention(),
    description: "The user id to compare with",
  }),
  userID2: new UserStringArgument({
    index: 1,
    mention: new DiscordIDMention(),
    description: "The other user id to compare (defaults to you)",
  }),
} as const;

export abstract class TasteCommand<
  T extends typeof tasteArgs = typeof tasteArgs
> extends LastFMBaseCommand<T> {
  subcategory = "taste";

  durationParser = new DurationParser();
  namedRangeParser = new NamedRangeParser();

  arguments = tasteArgs as T;

  timeRange?: TimeRange;

  protected async getUsernames(): Promise<[string, string]> {
    const usernames: string[] = [];

    // The following code is for parsing users
    // it essentially checks through the following arguments, checking if each one exists
    // if it does, it adds it to the usernames list (after two it stops checking)
    // if there's only one username, it makes the first user the sender, then the second user the mentioned user
    // this is because the order of the users matters for display
    for (const argName of [
      "user",
      "user2",
      "userID",
      "userID2",
      "lastfmUsername",
      "lastfmUsername2",
      "username",
      "username2",
    ]) {
      const parsedArguments = this.parsedArguments as any;

      if (usernames.length < 2 && parsedArguments[argName]) {
        let username: string | undefined;

        if (argName === "user" || argName === "user2") {
          username = await this.usersService.getUsername(
            this.ctx,
            parsedArguments[argName].id
          );
        } else if (argName === "userID" || argName === "userID2") {
          username = await this.usersService.getUsername(
            this.ctx,
            parsedArguments[argName]
          );
        } else if (argName === "username" || argName === "username2") {
          const usernameArgument = parsedArguments[argName] as string;

          if (
            !this.namedRangeParser.isNamedRange(usernameArgument) &&
            !this.durationParser.isDuration(usernameArgument) &&
            !isNumeric(usernameArgument)
          ) {
            username = usernameArgument;
          }
        } else if (
          argName === "lastfmUsername" ||
          argName === "lastfmUsername2"
        ) {
          username = parsedArguments[argName] as string;
        } else {
          throw new LogicError("please enter a user to compare your taste to!");
        }

        if (username) usernames.push(username);
      }
    }

    let [userOneUsername, userTwoUsername] = usernames;

    if (!userTwoUsername) {
      const senderUsername = await this.usersService.getUsername(
        this.ctx,
        this.author.id
      );

      userTwoUsername = userOneUsername;
      userOneUsername = senderUsername;
    }

    if (!userOneUsername || !userTwoUsername)
      throw new LogicError("please enter a user to compare your taste to!");

    return [userOneUsername, userTwoUsername];
  }

  protected getPaginators(usernameOne: string, usernameTwo: string) {
    const artistAmount = (this.parsedArguments as any).artistAmount as number,
      timePeriod = ((this.parsedArguments as any).timePeriod ||
        "overall") as LastFMPeriod,
      timeRange = (this.parsedArguments as any).timeRange as
        | TimeRange
        | undefined;

    this.timeRange = timeRange;

    const maxPages = artistAmount > 1000 ? 2 : 1;
    const params = {
      limit: artistAmount > 1000 ? Math.ceil(artistAmount / 2) : artistAmount,
      period: timePeriod,
      ...timeRange?.asTimeframeParams,
    };

    const senderPaginator = new Paginator(
      this.lastFMService.topArtists.bind(this.lastFMService),
      maxPages,
      { ...params, username: usernameOne },
      this.ctx
    );

    const mentionedPaginator = new Paginator(
      this.lastFMService.topArtists.bind(this.lastFMService),
      maxPages,
      { ...params, username: usernameTwo },
      this.ctx
    );

    return [senderPaginator, mentionedPaginator] as const;
  }

  protected generateTable(
    userOneUsername: string,
    userTwoUsername: string,
    artists: TasteArtist[]
  ): string {
    const padder = new StringPadder((val) => `${val}`);
    const maxArtists = 20;

    const paddedPlays1 = padder.generatedPaddedList(
      [
        userOneUsername,
        ...artists.slice(0, maxArtists).map((a) => a.user1plays),
      ],
      true
    );

    const paddedPlays2 = padder.generatedPaddedList([
      userTwoUsername,
      ...artists.slice(0, maxArtists).map((a) => a.user2plays),
    ]);

    const longestArtist = padder.maxLength(
      artists.slice(0, maxArtists).map((a) => a.name)
    );

    const headers = [
      `${paddedPlays1[0]}   ${paddedPlays2[0]}   Artist`,
      "=".repeat(
        `${paddedPlays1[0]}   ${paddedPlays2[0]}   `.length + longestArtist
      ),
    ];

    const table = artists
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
