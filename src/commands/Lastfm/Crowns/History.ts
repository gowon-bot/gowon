import { CrownsChildCommand } from "./CrownsChildCommand";
import { Arguments } from "../../../lib/arguments/arguments";
import { Message } from "discord.js";
import { dateDisplay } from "../../../helpers";
import { CrownEventString } from "../../../services/dbservices/CrownsHistoryService";
import { LogicError } from "../../../errors";
import { CrownEvent } from "../../../database/entity/meta/CrownEvent";

const args = {
  inputs: {
    artist: { index: { start: 0 } },
  },
} as const;

export class History extends CrownsChildCommand<typeof args> {
  idSeed = "wjsn cheng xiao";

  aliases = ["hist"];
  description = "Shows a crown's history";
  usage = ["", "artist"];

  arguments: Arguments = args;

  async run(message: Message) {
    let artist = this.parsedArguments.artist;

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
        `There is no history for the ${artistDetails.name.strong()} crown!`
      );
      return;
    }

    let history = await this.crownsService.scribe.getHistory(crown, [
      CrownEventString.snatched,
      CrownEventString.created,
    ]);

    if (!history.length) throw new LogicError("that crown has no history yet!");

    this.send(
      this.newEmbed()
        .setTitle(
          `Crown history for ${crown.artistName}${crown.redirectDisplay()}`
        )
        .setDescription(
          (await Promise.all(history.map(this.displayEvent.bind(this)))).join(
            "\n"
          )
        )
    );
  }

  private async displayEvent(event: CrownEvent): Promise<string> {
    switch (event.event) {
      case CrownEventString.created:
        return `${dateDisplay(
          event.happenedAt
        )} - created by ${await this.fetchUsername(
          event.perpetuatorDiscordID
        )} (${event.newCrown.plays})`;

      case CrownEventString.snatched:
        return `${dateDisplay(
          event.happenedAt
        )} - snatched by ${await this.fetchUsername(
          event.perpetuatorDiscordID
        )} (${event.oldCrown!.plays} → ${event.newCrown.plays})`;

      default:
        return "";
    }
  }
}
