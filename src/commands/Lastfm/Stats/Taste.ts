import { Message, MessageEmbed } from "discord.js";
import { Arguments } from "../../../lib/arguments/arguments";
import { TasteCalculator } from "../../../helpers/TasteCalculator";
import { numberDisplay } from "../../../helpers";
import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { sanitizeForDiscord } from "../../../helpers/discord";
import { Mention } from "../../../lib/arguments/mentions";
import { generatePeriod, generateHumanPeriod } from "../../../helpers/date";

export default class Taste extends LastFMBaseCommand {
  aliases = ["t"];
  description = "Shows your taste overlap with another user";

  arguments: Arguments = {
    inputs: {
      artistAmount: { index: 0, regex: /[0-9]{1,4}(?!\w)(?! [a-z])/g },
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
    },
    mentions: {
      user: {
        index: 0,
        description: "The user to compare your taste with",
        nonDiscordMentionParsing: this.ndmp,
      },
      userTwo: {
        index: 1,
        description: "A user to compare with another user",
        nonDiscordMentionParsing: this.ndmp,
      },
    },
  };

  async run(message: Message) {
    let userTwo = this.parsedArguments.userTwo as Mention,
      artistAmount =
        (this.parsedArguments.artistAmount as string).toInt() || 500,
      timePeriod = this.parsedArguments.timePeriod as string,
      humanReadableTimePeriod = this.parsedArguments
        .humanReadableTimePeriod as string;

    let {
      senderUsername: userOneUsername,
      mentionedUsername: userTwoUsername,
    } = await this.parseMentionedUsername(message);

    if (!userTwoUsername) {
      await message.reply("Please specify a user to compare taste with!");
      return;
    }

    if (artistAmount < 1 || artistAmount > 1000) {
      await message.reply("Please specify a valid amount!");
      return;
    }

    if (userTwo) {
      userOneUsername = userTwoUsername!;
      userTwoUsername =
        typeof userTwo === "string"
          ? userTwo
          : await this.usersService.getUsername(userTwo.id);
    }

    let [senderArtists, mentionedArtists] = await Promise.all([
      this.lastFMService.topArtists(
        userOneUsername,
        artistAmount,
        1,
        timePeriod
      ),
      this.lastFMService.topArtists(
        userTwoUsername,
        artistAmount,
        1,
        timePeriod
      ),
    ]);

    let tasteCalculator = new TasteCalculator(senderArtists, mentionedArtists);

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
          senderArtists.artist.length,
          "artist"
        )}, ${numberDisplay(taste.artists.length, "overlapping artist")} (${
          taste.percent
        }% match) found.`
      )
      .addFields(
        taste.artists.slice(0, 12).map((ta) => ({
          name: ta.name,
          value: `${numberDisplay(ta.user1plays, "play")} - ${numberDisplay(
            ta.user2plays,
            "play"
          )}`,
          inline: true,
        }))
      );

    await message.channel.send(embed);
  }
}
