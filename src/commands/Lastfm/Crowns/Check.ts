import { CrownsChildCommand } from "./CrownsChildCommand";
import { Arguments } from "../../../lib/arguments/arguments";
import { Message } from "discord.js";
import { CrownState } from "../../../services/dbservices/CrownsService";
import { CrownEmbeds } from "../../../lib/views/embeds/CrownEmbeds";
import {
  CrownBannedError,
  InactiveError,
  OptedOutError,
  PurgatoryError,
} from "../../../errors";

const args = {
  inputs: {
    artist: { index: { start: 0 } },
  },
} as const;

export class Check extends CrownsChildCommand<typeof args> {
  idSeed = "weki meki sei";

  aliases = ["c", "w"];
  description = "Checks a crown. If you have more plays, you will take it.";
  usage = ["", "artist"];

  arguments: Arguments = args;

  async run(message: Message) {
    const { senderUser, senderRequestable } = await this.getMentions();

    if (await senderUser?.inPurgatory(message)) throw new PurgatoryError();
    if (await senderUser?.inactive(message)) throw new InactiveError();
    if (await senderUser?.isCrownBanned(message)) throw new CrownBannedError();
    if (await senderUser?.isOptedOut(message)) throw new OptedOutError();

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
      crownCheck,
      this.message.author,
      this.gowonClient,
      artistInfo.userPlaycount,
      this.message,
      this.message.member ?? undefined
    );

    if (
      crownCheck.crown &&
      !(
        crownCheck.state === CrownState.updated &&
        crownCheck.crown.plays === crownCheck.oldCrown?.plays
      )
    ) {
      this.crownsService.scribe.handleCheck(this.ctx, crownCheck, message);
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
