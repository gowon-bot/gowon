import { CrownEvent } from "../../../database/entity/meta/CrownEvent";
import {
  CrownDoesntExistError,
  NoCrownHistoryError,
} from "../../../errors/commands/crowns";
import { asyncMap } from "../../../helpers";
import { prefabArguments } from "../../../lib/context/arguments/prefabArguments";
import { ArgumentsMap } from "../../../lib/context/arguments/types";
import { displayDate } from "../../../lib/ui/displays";
import { CrownEventString } from "../../../services/dbservices/crowns/CrownsHistoryService";
import { CrownsChildCommand } from "./CrownsChildCommand";

const args = {
  ...prefabArguments.artist,
} satisfies ArgumentsMap;

export class History extends CrownsChildCommand<typeof args> {
  idSeed = "wjsn cheng xiao";

  aliases = ["hist", "ch"];
  description = "Shows a crown's history";
  usage = ["", "artist"];

  arguments = args;

  slashCommand = true;

  async run() {
    const { requestable } = await this.getMentions({
      senderRequired: !this.parsedArguments.artist,
    });

    const artist = await this.lastFMArguments.getArtist(this.ctx, requestable);

    const artistDetails = await this.lastFMService.artistInfo(this.ctx, {
      artist,
    });

    const crown = await this.crownsService.getCrown(
      this.ctx,
      artistDetails.name,
      { refresh: false }
    );

    if (!crown) throw new CrownDoesntExistError(artistDetails.name);

    const history = await this.crownsService.scribe.getHistory(
      this.ctx,
      crown,
      [CrownEventString.snatched, CrownEventString.created]
    );

    if (!history.length) throw new NoCrownHistoryError(artistDetails.name);

    const embed = this.minimalEmbed()
      .setTitle(
        `Crown history for ${crown.artistName}${crown.redirectDisplay()}`
      )
      .setDescription(
        (await asyncMap(history, this.displayEvent.bind(this))).join("\n")
      );

    this.reply(embed);
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
