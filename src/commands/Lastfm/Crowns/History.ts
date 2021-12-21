import { CrownsChildCommand } from "./CrownsChildCommand";
import { CrownEventString } from "../../../services/dbservices/CrownsHistoryService";
import { LogicError } from "../../../errors";
import { CrownEvent } from "../../../database/entity/meta/CrownEvent";
import { displayDate } from "../../../lib/views/displays";
import { asyncMap } from "../../../helpers";
import { prefabArguments } from "../../../lib/context/arguments/prefabArguments";

const args = {
  ...prefabArguments.artist,
} as const;

export class History extends CrownsChildCommand<typeof args> {
  idSeed = "wjsn cheng xiao";

  aliases = ["hist", "ch"];
  description = "Shows a crown's history";
  usage = ["", "artist"];

  arguments = args;

  async run() {
    let artist = this.parsedArguments.artist;

    let { senderUsername } = await this.getMentions({
      senderRequired: !artist,
    });

    if (!artist) {
      artist = (await this.lastFMService.nowPlaying(this.ctx, senderUsername))
        .artist;
    }

    let artistDetails = await this.lastFMService.artistInfo(this.ctx, {
      artist,
    });

    let crown = await this.crownsService.getCrown(
      this.ctx,
      artistDetails.name,
      { refresh: false }
    );

    if (!crown) {
      throw new LogicError(
        `There is no history for the ${artistDetails.name.strong()} crown yet!`
      );
    }

    let history = await this.crownsService.scribe.getHistory(this.ctx, crown, [
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
          (await asyncMap(history, this.displayEvent.bind(this))).join("\n")
        )
    );
  }

  private async displayEvent(event: CrownEvent): Promise<string> {
    switch (event.event) {
      case CrownEventString.created:
        return `${displayDate(
          event.happenedAt
        )} - created by ${await this.fetchUsername(
          event.perpetuatorDiscordID
        )} (${event.newCrown.plays})`;

      case CrownEventString.snatched:
        return `${displayDate(
          event.happenedAt
        )} - snatched by ${await this.fetchUsername(
          event.perpetuatorDiscordID
        )} (${event.oldCrown!.plays} → ${event.newCrown.plays})`;

      default:
        return "";
    }
  }
}
