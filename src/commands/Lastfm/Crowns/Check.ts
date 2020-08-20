import { CrownsChildCommand } from "./CrownsChildCommand";
import { Arguments } from "../../../lib/arguments/arguments";
import { Message } from "discord.js";
import { CrownState } from "../../../services/dbservices/CrownsService";
import { CrownEmbeds } from "../../../helpers/Embeds/CrownEmbeds";
import { userHasRole } from "../../../helpers/discord";
import { InactiveError, OptedOutError, PurgatoryError } from "../../../errors";
import { Logger } from "../../../lib/Logger";

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
    if (
      userHasRole(
        message.member!,
        await this.botMomentService.getInactiveRole(message.guild!)
      )
    ) {
      throw new InactiveError();
    }

    if (
      userHasRole(
        message.member!,
        await this.botMomentService.getPurgatoryRole(message.guild!)
      )
    ) {
      throw new PurgatoryError();
    }

    if (
      await this.crownsService.isUserOptedOut(
        message.guild?.id!,
        message.author.id
      )
    ) {
      throw new OptedOutError();
    }

    let artist = this.parsedArguments.artist as string;

    let { username } = await this.parseMentionedUsername(message);

    if (!artist) {
      artist = (await this.lastFMService.nowPlayingParsed(username)).artist;
    }

    let artistDetails = await this.lastFMService.artistInfo({
      artist,
      username,
    });

    let crownCheck = await this.crownsService.checkCrown({
      serverID: message.guild?.id!,
      discordID: message.author.id,
      artistName: artistDetails.name,
      plays: artistDetails.stats.userplaycount.toInt(),
    });

    this.logger.log("Crown Check", Logger.formatObject(crownCheck));

    switch (crownCheck.state) {
      case CrownState.newCrown:
        await message.channel.send(
          CrownEmbeds.newCrown(crownCheck, message.author)
        );
        break;
      case CrownState.updated:
        await message.channel.send(CrownEmbeds.updatedCrown(crownCheck));
        break;
      case CrownState.snatched:
        await message.channel.send(
          await CrownEmbeds.snatchedCrown(crownCheck, message.author, message)
        );
        break;
      case CrownState.fail:
        await message.channel.send(
          await CrownEmbeds.fail(
            crownCheck,
            artistDetails,
            message,
            message.author
          )
        );
        break;
      case CrownState.tie:
        await message.channel.send(
          await CrownEmbeds.tie(
            crownCheck,
            artistDetails,
            message,
            message.author
          )
        );
        break;
      case CrownState.tooLow:
        await message.channel.send(
          await CrownEmbeds.tooLow(
            artistDetails.name,
            this.crownsService.threshold,
            message.author,
            artistDetails.stats.userplaycount
          )
        );
    }
  }
}
