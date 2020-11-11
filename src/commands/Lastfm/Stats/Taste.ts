import { Message } from "discord.js";
import { Arguments } from "../../../lib/arguments/arguments";
import { TasteCalculator } from "../../../lib/calculators/TasteCalculator";
import { numberDisplay, StringPadder } from "../../../helpers";
import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { sanitizeForDiscord } from "../../../helpers/discord";
import { generatePeriod, generateHumanPeriod } from "../../../helpers/date";
import { Variation } from "../../../lib/command/BaseCommand";
import { RunAs } from "../../../lib/AliasChecker";
import {
  LastFMPeriod,
  TopArtists,
} from "../../../services/LastFM/LastFMService.types";
import { Validation } from "../../../lib/validation/ValidationChecker";
import { validators } from "../../../lib/validation/validators";
import { Paginator } from "../../../lib/Paginator";
import { LastFMMention } from "../../../lib/arguments/mentions/LastFMMention";
import { DiscordIDMention } from "../../../lib/arguments/mentions/DiscordIDMention";
import { LogicError } from "../../../errors";
import { DurationParser } from "../../../lib/DurationParser";

export default class Taste extends LastFMBaseCommand {
  aliases = ["t"];
  description = "Shows your taste overlap with another user";
  subcategory = "library stats";
  usage = [
    "",
    "@user or lfm:username",
    "time period @user",
    "username amount time period",
  ];

  variations: Variation[] = [
    {
      variationString: "tb",
      description: "Uses a table view instead of an embed to display",
    },
  ];

  arguments: Arguments = {
    inputs: {
      artistAmount: {
        index: 0,
        regex: /[0-9]+(?!\w)(?! [a-z])/g,
        default: 1000,
        number: true,
      },
      timePeriod: {
        custom: (messageString: string) =>
          generatePeriod(messageString, "overall"),
        index: -1,
      },
      humanReadableTimePeriod: {
        custom: (messageString: string) =>
          generateHumanPeriod(messageString, "overall"),
        index: -1,
      },
      username: {
        regex: /[0-9]?[a-zA-Z_\-\!]+[0-9]?/gi,
        index: 0,
      },
      username2: {
        regex: /[0-9]?[a-zA-Z_\-\!]+[0-9]?/gi,
        index: 1,
      },
    },
    mentions: {
      user: { index: 0 },
      userTwo: { index: 1 },
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
    },
  };

  validation: Validation = {
    artistAmount: { validator: new validators.Range({ min: 100, max: 2000 }) },
  };

  durationParser = new DurationParser();

  async run(_: Message, runAs: RunAs) {
    let artistAmount = this.parsedArguments.artistAmount as number,
      timePeriod = this.parsedArguments.timePeriod as LastFMPeriod,
      humanReadableTimePeriod = this.parsedArguments
        .humanReadableTimePeriod as string;

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
      if (usernames.length < 2 && this.parsedArguments[argName]) {
        let username: string | undefined;

        if (argName === "user" || argName === "user2") {
          username = await this.usersService.getUsername(
            this.parsedArguments[argName].id
          );
        } else if (argName === "userID" || argName === "userID2") {
          username = await this.usersService.getUsername(
            this.parsedArguments[argName]
          );
        } else if (argName === "username" || argName === "username2") {
          if (!this.durationParser.isDuration(this.parsedArguments[argName]))
            username = this.parsedArguments[argName] as string;
        } else if (argName === "lfmUser" || argName === "lfmUser2") {
          username = this.parsedArguments[argName] as string;
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

    let maxPages = artistAmount > 1000 ? 2 : 1;
    let params = {
      limit: artistAmount > 1000 ? Math.ceil(artistAmount / 2) : artistAmount,
      period: timePeriod,
    };

    let senderPaginator = new Paginator(
      this.lastFMService.topArtists.bind(this.lastFMService),
      maxPages,
      { ...params, username: userOneUsername }
    );

    let mentionedPaginator = new Paginator(
      this.lastFMService.topArtists.bind(this.lastFMService),
      maxPages,
      { ...params, username: userTwoUsername }
    );

    let [senderArtists, mentionedArtists] = (await Promise.all([
      senderPaginator.getAll({ concatTo: "artist" }),
      mentionedPaginator.getAll({ concatTo: "artist" }),
    ])) as [TopArtists, TopArtists];

    let tasteCalculator = new TasteCalculator(
      senderArtists,
      mentionedArtists,
      artistAmount
    );

    let taste = tasteCalculator.calculate();

    if (taste.artists.length === 0)
      throw new LogicError(
        `${userOneUsername.code()} and ${userTwoUsername.code()} share no common artists!`
      );

    let embed = this.newEmbed()
      .setTitle(
        `Taste comparison for ${sanitizeForDiscord(
          userOneUsername
        )} and ${sanitizeForDiscord(
          userTwoUsername
        )} ${humanReadableTimePeriod}`
      )
      .setDescription(
        `Comparing top ${numberDisplay(
          senderArtists.artist.slice(0, artistAmount).length,
          "artist"
        )}, ${numberDisplay(taste.artists.length, "overlapping artist")} (${
          taste.percent
        }% match) found.`
      );

    if (runAs.variationWasUsed("tb")) {
      let padder = new StringPadder((val) => `${val}`);
      let maxArtists = 20;

      let paddedPlays1 = padder.generatedPaddedList(
        [
          userOneUsername,
          ...taste.artists.slice(0, maxArtists).map((a) => a.user1plays),
        ],
        true
      );
      let paddedPlays2 = padder.generatedPaddedList([
        userTwoUsername,
        ...taste.artists.slice(0, maxArtists).map((a) => a.user2plays),
      ]);
      let longestArtist = padder.maxLength(
        taste.artists.slice(0, maxArtists).map((a) => a.name)
      );

      let headers = [
        `${paddedPlays1[0]}   ${paddedPlays2[0]}   Artist`,
        "=".repeat(
          `${paddedPlays1[0]}   ${paddedPlays2[0]}   `.length + longestArtist
        ),
      ];

      let table = taste.artists
        .slice(0, maxArtists)
        .map(
          (a, idx) =>
            `${paddedPlays1[idx + 1]} ${
              paddedPlays1[idx + 1].trim().toInt() ===
              paddedPlays2[idx + 1].trim().toInt()
                ? "•"
                : paddedPlays1[idx + 1].trim().toInt() >
                  paddedPlays2[idx + 1].trim().toInt()
                ? ">"
                : "<"
            } ${paddedPlays2[idx + 1]}   ${a.name}`
        );

      embed.setDescription(`
      ${embed.description}
      
      \`\`\`
${[...headers, ...table].join("\n")}\`\`\`
      `);
    } else {
      embed = embed.addFields(
        taste.artists.slice(0, 12).map((ta) => ({
          name: ta.name,
          value: `${numberDisplay(ta.user1plays, "play")} - ${numberDisplay(
            ta.user2plays,
            "play"
          )}`,
          inline: true,
        }))
      );
    }

    await this.send(embed);
  }
}
