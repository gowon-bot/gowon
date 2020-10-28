import { Message, MessageEmbed } from "discord.js";
import { Arguments } from "../../../lib/arguments/arguments";
import { TasteCalculator } from "../../../lib/calculators/TasteCalculator";
import { numberDisplay, StringPadder } from "../../../helpers";
import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { sanitizeForDiscord } from "../../../helpers/discord";
import { ParsedMention } from "../../../lib/arguments/mentions/mentions";
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

export default class Taste extends LastFMBaseCommand {
  aliases = ["t"];
  variations: Variation[] = [
    {
      variationString: "tb",
      description: "Uses a table view instead of an embed to display",
    },
  ];
  description = "Shows your taste overlap with another user";
  subcategory = "library stats";
  usage = ["", "@user or lfm:username", "time period @user"];

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
        regex: /[\w\-.!]+/i,
        index: 0,
      },
    },
    mentions: {
      user: {
        index: 0,
        description: "The user to compare your taste with",
        mention: new LastFMMention(),
      },
      userTwo: {
        index: 1,
        description: "A user to compare with another user",
        mention: new LastFMMention(),
      },
    },
  };

  validation: Validation = {
    artistAmount: { validator: new validators.Range({ min: 100, max: 2000 }) },
  };

  async run(_: Message, runAs: RunAs) {
    let userTwo = this.parsedArguments.userTwo as ParsedMention,
      artistAmount = this.parsedArguments.artistAmount as number,
      timePeriod = this.parsedArguments.timePeriod as LastFMPeriod,
      humanReadableTimePeriod = this.parsedArguments
        .humanReadableTimePeriod as string;

    let {
      senderUsername: userOneUsername,
      mentionedUsername: userTwoUsername,
    } = await this.parseMentions({ inputArgumentName: "username" });

    if (!userTwoUsername) {
      await this.reply("Please specify a user to compare taste with!");
      return;
    }

    if (userTwo) {
      userOneUsername = userTwoUsername!;
      userTwoUsername =
        typeof userTwo === "string"
          ? userTwo
          : await this.usersService.getUsername(userTwo.id);
    }

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

    let embed = new MessageEmbed()
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

    if (runAs.lastString() === "tb") {
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
