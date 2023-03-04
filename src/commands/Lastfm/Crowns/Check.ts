import {
  CrownBannedError,
  InactiveError,
  OptedOutError,
  PurgatoryError,
} from "../../../errors/errors";
import { prefabArguments } from "../../../lib/context/arguments/prefabArguments";
import { ArgumentsMap } from "../../../lib/context/arguments/types";
import { CrownEmbeds } from "../../../lib/views/embeds/CrownEmbeds";
import { CrownState } from "../../../services/dbservices/CrownsService";
import { CrownsChildCommand } from "./CrownsChildCommand";

const args = {
  ...prefabArguments.artist,
} satisfies ArgumentsMap;

export class Check extends CrownsChildCommand<typeof args> {
  idSeed = "weki meki sei";

  aliases = ["c", "w"];
  description = "Checks a crown. If you have more plays, you will take it.";
  usage = ["", "artist"];

  slashCommand = true;

  arguments = args;

  async run() {
    const { senderUser, senderRequestable } = await this.getMentions();

    if (await senderUser?.inPurgatory(this.ctx)) throw new PurgatoryError();
    if (await senderUser?.inactive(this.ctx)) throw new InactiveError();
    if (await senderUser?.isCrownBanned(this.ctx)) throw new CrownBannedError();
    if (await senderUser?.isOptedOut(this.ctx)) throw new OptedOutError();

    const artist = await this.lastFMArguments.getArtist(
      this.ctx,
      senderRequestable
    );

    const artistInfo = await this.lastFMService.artistInfo(this.ctx, {
      artist,
      username: senderRequestable,
    });

    const crownCheck = await this.crownsService.checkCrown(this.ctx, {
      artistName: artistInfo.name,
      plays: artistInfo.userPlaycount,
    });

    const embeds = new CrownEmbeds(
      this.ctx,
      crownCheck,
      this.payload.author,
      this.gowonClient,
      artistInfo.userPlaycount,
      this.payload.member ?? undefined
    );

    if (
      crownCheck.crown &&
      !(
        crownCheck.state === CrownState.updated &&
        crownCheck.crown.plays === crownCheck.oldCrown?.plays
      )
    ) {
      this.crownsService.scribe.handleCheck(this.ctx, crownCheck);
    }

    const embed =
      crownCheck.state === CrownState.newCrown
        ? embeds.newCrown()
        : crownCheck.state === CrownState.updated
        ? embeds.updatedCrown()
        : crownCheck.state === CrownState.snatched
        ? embeds.snatchedCrown()
        : crownCheck.state === CrownState.fail
        ? embeds.fail()
        : crownCheck.state === CrownState.tie
        ? embeds.tie()
        : crownCheck.state === CrownState.tooLow
        ? embeds.tooLow(this.crownsService.threshold)
        : crownCheck.state === CrownState.inactivity
        ? embeds.inactivity()
        : crownCheck.state === CrownState.purgatory
        ? embeds.purgatory()
        : crownCheck.state === CrownState.left
        ? embeds.left()
        : crownCheck.state === CrownState.banned
        ? embeds.banned()
        : crownCheck.state === CrownState.loggedOut
        ? embeds.loggedOut()
        : this.newEmbed();

    await this.send(await embed);
  }
}
