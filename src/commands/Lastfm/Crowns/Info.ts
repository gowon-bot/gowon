import { CrownsChildCommand } from "./CrownsChildCommand";
import { Arguments } from "../../../lib/arguments/arguments";
import { Message } from "discord.js";
import { numberDisplay, ago } from "../../../helpers";
import { User } from "../../../database/entity/User";
import { RedirectsService } from "../../../services/dbservices/RedirectsService";
import { Variation } from "../../../lib/command/BaseCommand";
import { RunAs } from "../../../lib/AliasChecker";
import { createInvalidBadge } from "../../../helpers/crowns";

export class Info extends CrownsChildCommand {
  aliases = ["wh"];
  description = "Shows who has a crown";
  usage = ["", "artist"];

  variations: Variation[] = [
    {
      variationString: "whv",
      description: "Shows some more information about the crown",
    },
  ];

  arguments: Arguments = {
    inputs: {
      artist: { index: { start: 0 } },
    },
  };

  redirectsService = new RedirectsService(this.logger);

  async run(message: Message, runAs: RunAs) {
    let artist = this.parsedArguments.artist as string;

    let { senderUsername, senderUser } = await this.parseMentions({
      usernameRequired: !artist,
    });

    if (!artist) {
      artist = (await this.lastFMService.nowPlayingParsed(senderUsername))
        .artist;
    }

    let artistDetails = await this.lastFMService.artistInfo(
      senderUsername
        ? {
            artist,
            username: senderUsername,
          }
        : { artist }
    );

    let redirectArtistName =
      (await this.redirectsService.getRedirect(artistDetails.name))?.to ||
      artistDetails.name;

    let crown = await this.crownsService.getCrown(
      redirectArtistName,
      this.guild.id,
      {
        showDeleted: false,
        noRedirect: true,
      }
    );

    if (!crown) {
      await this.reply(
        `No one has the crown for ${redirectArtistName.bold()}${
          redirectArtistName !== artistDetails.name
            ? ` _(redirected from ${artistDetails.name})_`
            : ""
        }`
      );
      return;
    }

    let invalidCheck = await crown?.invalid(message);

    let invalidBadge = createInvalidBadge(invalidCheck.reason);

    if (crown.user.id === senderUser?.id && artistDetails.stats.userplaycount) {
      crown.plays = artistDetails.stats.userplaycount.toInt();
      crown.save();
    } else if (crown.user.lastFMUsername) {
      await crown.refresh({ logger: this.logger });
    }

    if (crown.user.id) {
      let holderUser = await User.toDiscordUser2(
        this.gowonClient.client,
        crown.user.discordID
      );

      let holderUsername = holderUser?.username;

      if (runAs.variationWasUsed("whv")) {
        let embed = this.newEmbed()
          .setTitle(
            `Who has ${crown.artistName.bold()}?` + crown.redirectDisplay()
          )
          .setDescription(
            `${
              holderUsername || "???"
            }${invalidBadge} has the crown for ${crown.artistName.bold()} with ${numberDisplay(
              crown.plays,
              "play"
            )}

          Created ${ago(crown.createdAt)}${
              crown.version > 1 ? ". Last stolen " + ago(crown.lastStolen) : ""
            }

          _It ${
            crown.version === 0
              ? "has never been stolen"
              : "has been stolen " + numberDisplay(crown.version, "time")
          }_`
          );

        await this.send(embed);
      } else {
        await this.reply(
          `${
            holderUsername?.bold() ||
            this.gowonService.constants.unknownUserDisplay
          }${invalidBadge} has the crown for ${crown.artistName.bold()} with **${numberDisplay(
            crown.plays,
            "**play"
          )}.`
        );
      }
    }
  }
}
