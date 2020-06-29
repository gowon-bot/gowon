import { CrownsChildCommand } from "./CrownsChildCommand";
import { Arguments } from "../../../lib/arguments/arguments";
import { Message } from "discord.js";
import { CrownState } from "../../../services/dbservices/CrownsService";
import { CrownEmbeds } from "../../../helpers/Embeds/CrownEmbeds";

export class Check extends CrownsChildCommand {
  aliases = ["c"];
  description = "Checks a crown";

  arguments: Arguments = {
    inputs: {
      artist: { index: { start: 0 } },
    },
  };

  async run(message: Message) {
    this.logger.log("message", message.guild?.id)

    let artist = this.parsedArguments.artist as string;

    let { username } = await this.parseMentionedUsername(message);

    if (!artist) {
      artist = (await this.lastFMService.nowPlayingParsed(username)).artist;
    }

    let artistDetails = await this.lastFMService.artistInfo(artist, username);

    let crownCheck = await this.crownsService.checkCrown({
      serverID: message.guild?.id!,
      discordID: message.author.id,
      artistName: artistDetails.name,
      plays: parseInt(artistDetails.stats.userplaycount, 10),
    });

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
