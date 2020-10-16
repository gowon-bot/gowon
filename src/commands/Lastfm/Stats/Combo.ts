import { MessageEmbed } from "discord.js";
import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { Arguments } from "../../../lib/arguments/arguments";
import { ComboCalculator } from "../../../lib/calculators/ComboCalculator";
import { numberDisplay } from "../../../helpers";
import { Paginator } from "../../../lib/Paginator";
import { RedirectsService } from "../../../services/dbservices/RedirectsService";
import { Validation } from "../../../lib/validation/ValidationChecker";
import { validators } from "../../../lib/validation/validators";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";

export default class Combo extends LastFMBaseCommand {
  aliases = ["streak", "str"];
  description = "shows your current streak";
  subcategory = "library stats";
  usage = ["", "amount_to_check @user"];

  arguments: Arguments = {
    inputs: {
      streakAmount: {
        index: 0,
        regex: /-?[0-9]+/g,
        default: 1000,
        number: true,
      },
    },
    mentions: standardMentions,
  };

  validation: Validation = {
    streakAmount: {
      validator: new validators.Range({ min: 1, max: 1000 }),
      friendlyName: "the number of recent tracks",
    },
  };

  redirectsService = new RedirectsService(this.logger);

  async run() {
    let { username } = await this.parseMentions();

    let streakAmount = this.parsedArguments.streakAmount as number;

    let paginator = new Paginator(
      this.lastFMService.recentTracks.bind(this.lastFMService),
      this.gowonService.contants.hardPageLimit,
      { username, limit: streakAmount }
    );

    let comboCalculator = new ComboCalculator(this.redirectsService);

    let combo = await comboCalculator.calculate(paginator);

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
                  combo.artist.hitMax ? "+" : combo.artist.nowplaying ? "➚" : ""
                } in a row (${combo.artist.name.bold()})\n`
              : "") +
              (combo.album.plays > 0
                ? `Album: ${combo.album.plays}${
                    combo.album.hitMax ? "+" : combo.album.nowplaying ? "➚" : ""
                  } in a row (${combo.album.name.italic()})\n`
                : "") +
              (combo.track.plays > 0
                ? `Track: ${combo.track.plays}${
                    combo.track.hitMax ? "+" : combo.track.nowplaying ? "➚" : ""
                  } in a row (${combo.track.name.bold()})\n`
                : "")
          : "No consecutive plays found!"
      );

    await this.send(embed);
  }
}
