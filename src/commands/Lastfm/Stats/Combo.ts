import { Message, MessageEmbed } from "discord.js";
import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { Arguments } from "../../../lib/arguments/arguments";
import { ComboCalculator } from "../../../lib/calculators/ComboCalculator";
import { numberDisplay } from "../../../helpers";

export default class Combo extends LastFMBaseCommand {
  aliases = ["streak", "str"];
  description = "shows your current streak";
  subcategory = "library stats";
  usage = ["", "amount_to_check @user"];

  arguments: Arguments = {
    inputs: {
      streakAmount: { index: 0, regex: /[0-9]{1,4}/g },
    },
    mentions: {
      user: {
        index: 0,
        description: "The user to lookup",
        nonDiscordMentionParsing: this.ndmp,
      },
    },
  };

  async run(message: Message) {
    let { username } = await this.parseMentionedUsername(message);

    let streakAmount =
      (this.parsedArguments.streakAmount as string)?.toInt() || 1000;

    if (streakAmount < 1 || streakAmount > 1000) {
      await message.reply("Please specify a valid amount!");
      return;
    }

    let recentTracks = await this.lastFMService.recentTracks(
      username,
      streakAmount
    );

    let comboCalculator = new ComboCalculator();

    let combo = comboCalculator.calculate(recentTracks);

    let embed = new MessageEmbed()
      .setTitle(
        `Streak for ${username.code()} (from recent ${numberDisplay(
          streakAmount,
          "track"
        )})`
      )
      .setDescription(
        combo.hasAnyConsecutivePlays
          ? (combo.artist.plays > 0
              ? `Artist: ${combo.artist.plays}${
                  combo.artist.nowplaying ? "➚" : ""
                } in a row (${combo.artist.name.bold()})\n`
              : "") +
              (combo.album.plays > 0
                ? `Album: ${combo.album.plays}${
                    combo.album.nowplaying ? "➚" : ""
                  } in a row (${combo.album.name.italic()})\n`
                : "") +
              (combo.track.plays > 0
                ? `Track: ${combo.track.plays}${
                    combo.track.nowplaying ? "➚" : ""
                  } in a row (${combo.track.name.bold()})\n`
                : "")
          : "No consecutive plays found!"
      );

    await message.channel.send(embed);
  }
}
