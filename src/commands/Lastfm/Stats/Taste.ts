import { Message, MessageEmbed, User } from "discord.js";
import { Arguments } from "../../../lib/arguments/arguments";
import { TasteCalculator } from "../../../helpers/TasteCalculator";
import { numberDisplay } from "../../../helpers";
import { LastFMBaseCommand } from "../LastFMBaseCommand";

export default class Taste extends LastFMBaseCommand {
  aliases = ["t"];
  description = "Shows your taste overlap with another user";

  arguments: Arguments = {
    inputs: {
      artistAmount: { index: 0, regex: /[0-9]{1,4}/g },
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
    let userTwo = this.parsedArguments.userTwo as User,
      artistAmount =
        parseInt(this.parsedArguments.artistAmount as string, 10) || 500;

    let {
      senderUsername: userOneUsername,
      mentionedUsername: userTwoUsername,
    } = await this.parseMentionedUsername(message);

    if (!userTwoUsername) {
      await message.reply("Please specify a user to compare taste with!");
      return;
    }

    if (artistAmount < 1 || artistAmount > 1000) {
      await message.reply("Please specify a valid amount input!");
      return;
    }

    if (userTwo) {
      userOneUsername = userTwoUsername!;
      userTwoUsername = await this.usersService.getUsername(userTwo.id);
    }

    let [senderArtists, mentionedArtists] = await Promise.all([
      this.lastFMService.topArtists(userOneUsername, artistAmount),
      this.lastFMService.topArtists(userTwoUsername, artistAmount),
    ]);

    let tasteCalculator = new TasteCalculator(senderArtists, mentionedArtists);

    let taste = tasteCalculator.calculate();

    let embed = new MessageEmbed()
      .setTitle(
        `Taste comparison for ${userOneUsername} and ${userTwoUsername}`
      )
      .setDescription(
        `Comparing top ${numberDisplay(
          artistAmount,
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
