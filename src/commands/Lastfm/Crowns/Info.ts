import { CrownsChildCommand } from "./CrownsChildCommand";
import { Arguments } from "../../../lib/arguments/arguments";
import { Message } from "discord.js";
import { numberDisplay, ago } from "../../../helpers";
import { RedirectsService } from "../../../services/dbservices/RedirectsService";
import { createInvalidBadge } from "../../../helpers/crowns";
import { ArtistCrownBannedError } from "../../../errors";

const args = {
  inputs: {
    artist: { index: { start: 0 } },
  },
} as const;

export class Info extends CrownsChildCommand<typeof args> {
  idSeed = "wjsn dayoung";

  aliases = ["wh"];
  description = "Shows who has the crown for a given user";
  usage = ["", "artist"];

  arguments: Arguments = args;

  redirectsService = new RedirectsService(this.logger);

  async run(message: Message) {
    let artist = this.parsedArguments.artist;

    let { senderUsername, senderUser } = await this.parseMentions({
      usernameRequired: !artist,
    });

    if (!artist) {
      artist = (await this.lastFMService.nowPlaying(senderUsername)).artist;
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
      if (
        await this.gowonService.isArtistCrownBanned(
          this.guild,
          redirectArtistName
        )
      ) {
        throw new ArtistCrownBannedError(redirectArtistName);
      }

      await this.traditionalReply(
        `no one has the crown for ${redirectArtistName.strong()}${
          redirectArtistName !== artistDetails.name
            ? ` _(redirected from ${artistDetails.name})_`
            : ""
        }`
      );
      return;
    }

    let invalidCheck = await crown?.invalid(message);

    let invalidBadge = createInvalidBadge(invalidCheck.reason);

    if (crown.user.id === senderUser?.id && artistDetails.userPlaycount) {
      crown.plays = artistDetails.userPlaycount;
      crown.save();
    } else if (crown.user.lastFMUsername) {
      await crown.refresh({ logger: this.logger });
    }

    if (crown.user.id) {
      let holderUsername = await this.fetchUsername(crown.user.discordID);

      let embed = this.newEmbed()
        .setTitle(
          `Who has ${crown.artistName.strong()}?` + crown.redirectDisplay()
        )
        .setDescription(
          `${holderUsername}${invalidBadge} has the crown for ${crown.artistName.strong()} with ${numberDisplay(
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
    }
  }
}
