import { CrownsChildCommand } from "./CrownsChildCommand";
import { Arguments } from "../../../lib/arguments/arguments";
import { Message, MessageEmbed } from "discord.js";
import { dateDisplay } from "../../../helpers";
import { CrownEventString } from "../../../services/dbservices/CrownsHistoryService";

export class History extends CrownsChildCommand {
  aliases = ["hist"];
  description = "Shows a crown's history";
  usage = ["", "artist"];

  arguments: Arguments = {
    inputs: {
      artist: { index: { start: 0 } },
    },
  };

  async run(message: Message) {
    let artist = this.parsedArguments.artist as string;

    let { senderUsername } = await this.parseMentions({
      senderRequired: !artist,
    });

    if (!artist) {
      artist = (await this.lastFMService.nowPlayingParsed(senderUsername))
        .artist;
    }

    let artistDetails = await this.lastFMService.artistInfo({
      artist,
    });

    let crown = await this.crownsService.getCrown(
      artistDetails.name,
      message.guild?.id!,
      { refresh: false }
    );

    if (!crown) {
      await this.send(
        `There is no history for the ${artistDetails.name.bold()} crown!`
      );
      return;
    }

    let history = await this.crownsService.scribe.getHistory(crown, [
      CrownEventString.snatched,
    ]);

    this.send(
      new MessageEmbed()
        .setTitle(
          `Crown history for ${crown.artistName}${crown.redirectDisplay()}`
        )
        .setDescription(
          "```" +
            history
              .map(
                (h) =>
                  `${dateDisplay(h.happenedAt)} - snatched by ${
                    h.perpetuatorUsername
                  } (${h.oldCrown!.plays} → ${h.newCrown.plays})`
              )
              .join("\n") +
            "```"
        )
    );
  }
}
