import { CrownsChildCommand } from "./CrownsChildCommand";
import { Arguments } from "../../../lib/arguments/arguments";
import { Message } from "discord.js";
import { CrownState } from "../../../services/dbservices/CrownsService";
import { CrownEmbeds } from "../../../helpers/Embeds/CrownEmbeds";
import { userHasRole } from "../../../helpers/discord";
import { InactiveError, OptedOutError, PurgatoryError } from "../../../errors";

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
        await this.gowonService.getInactiveRole(message.guild!)
      )
    ) {
      throw new InactiveError();
    }

    if (
      userHasRole(
        message.member!,
        await this.gowonService.getPurgatoryRole(message.guild!)
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

    let { username } = await this.parseMentionedUsername();

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

    switch (crownCheck.state) {
      case CrownState.newCrown:
        await this.send(
          CrownEmbeds.newCrown(crownCheck, message.author)
        );
        break;
      case CrownState.updated:
        await this.send(CrownEmbeds.updatedCrown(crownCheck));
        break;
      case CrownState.snatched:
        await this.send(
          await CrownEmbeds.snatchedCrown(crownCheck, message.author, message)
        );
        break;
      case CrownState.fail:
        await this.send(
          await CrownEmbeds.fail(
            crownCheck,
            artistDetails,
            message,
            message.author
          )
        );
        break;
      case CrownState.tie:
        await this.send(
          await CrownEmbeds.tie(
            crownCheck,
            artistDetails,
            message,
            message.author
          )
        );
        break;
      case CrownState.tooLow:
        await this.send(
          await CrownEmbeds.tooLow(
            artistDetails.name,
            this.crownsService.threshold,
            message.author,
            artistDetails.stats.userplaycount
          )
        );
        break;
      case CrownState.inactivity:
        await this.send(
          await CrownEmbeds.inactivity(crownCheck, message.author, message)
        );
        break;
      case CrownState.purgatory:
        await this.send(
          await CrownEmbeds.purgatory(crownCheck, message.author, message)
        );
        break;
      case CrownState.left:
        await this.send(
          await CrownEmbeds.left(crownCheck, message.author)
        );
        break;
    }
  }
}
