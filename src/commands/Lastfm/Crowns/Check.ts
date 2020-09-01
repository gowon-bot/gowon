import { CrownsChildCommand } from "./CrownsChildCommand";
import { Arguments } from "../../../lib/arguments/arguments";
import { Message, MessageEmbed } from "discord.js";
import { CrownState } from "../../../services/dbservices/CrownsService";
import { CrownEmbeds } from "../../../helpers/Embeds/CrownEmbeds";
import {
  CrownBannedError,
  InactiveError,
  OptedOutError,
  PurgatoryError,
} from "../../../errors";

export class Check extends CrownsChildCommand {
  aliases = ["c"];
  description = "Checks a crown";
  usage = ["", "artist"];

  arguments: Arguments = {
    inputs: {
      artist: { index: { start: 0 } },
    },
  };

  async run(message: Message) {
    let artist = this.parsedArguments.artist as string;

    let { username, senderUser } = await this.parseMentionedUsername();

    if (await senderUser?.inPurgatory(message)) throw new PurgatoryError();
    if (await senderUser?.inactive(message)) throw new InactiveError();
    if (await senderUser?.isCrownBanned(message)) throw new CrownBannedError();
    if (await senderUser?.isOptedOut(message)) throw new OptedOutError();

    if (!artist) {
      artist = (await this.lastFMService.nowPlayingParsed(username)).artist;
    }

    let artistDetails = await this.lastFMService.artistInfo({
      artist,
      username,
    });

    let crownCheck = await this.crownsService.checkCrown({
      message,
      discordID: message.author.id,
      artistName: artistDetails.name,
      plays: artistDetails.stats.userplaycount.toInt(),
    });

    let embeds = new CrownEmbeds(
      crownCheck,
      message.author,
      message,
      artistDetails.stats.userplaycount.toInt()
    );

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
        ? embeds.tooLow(artistDetails.name, this.crownsService.threshold)
        : crownCheck.state === CrownState.inactivity
        ? embeds.inactivity()
        : crownCheck.state === CrownState.purgatory
        ? embeds.purgatory()
        : crownCheck.state === CrownState.left
        ? embeds.left()
        : crownCheck.state === CrownState.banned
        ? embeds.banned()
        : new MessageEmbed();

    await this.send(await embed);
  }
}
