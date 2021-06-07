import { CrownsChildCommand } from "./CrownsChildCommand";
import { Arguments } from "../../../lib/arguments/arguments";
import { Message } from "discord.js";
import { CrownState } from "../../../services/dbservices/CrownsService";
import { CrownEmbeds } from "../../../lib/views/embeds/CrownEmbeds";
import {
  CrownBannedError,
  InactiveError,
  LogicError,
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
    let artist = this.parsedArguments.artist;

    let { senderUser, requestable } = await this.parseMentions();

    if (await senderUser?.inPurgatory(message)) throw new PurgatoryError();
    if (await senderUser?.inactive(message)) throw new InactiveError();
    if (await senderUser?.isCrownBanned(message)) throw new CrownBannedError();
    if (await senderUser?.isOptedOut(message)) throw new OptedOutError();

    if (!artist) {
      let response = await this.lastFMService.nowPlaying(requestable);
      if (!response.isNowPlaying)
        throw new LogicError(
          "you don't appear to be currently scrobbling anything."
        );
      artist = response.artist;
    }

    let artistDetails = await this.lastFMService.artistInfo({
      artist,
      username: requestable,
    });

    let crownCheck = await this.crownsService.checkCrown({
      message,
      discordID: message.author.id,
      artistName: artistDetails.name,
      plays: artistDetails.userPlaycount,
    });

    let embeds = new CrownEmbeds(
      crownCheck,
      this.message.author,
      this.gowonClient,
      artistDetails.userPlaycount,
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
      this.crownsService.scribe.handleCheck(crownCheck, message);
    }

    let embed =
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
        : this.newEmbed();

    await this.send(await embed);
  }
}
