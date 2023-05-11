import { User } from "../../../database/entity/User";
import { ArtistIsCrownBannedError } from "../../../errors/commands/crowns";
import { ago } from "../../../helpers";
import { createInvalidBadge } from "../../../helpers/crowns";
import { bold } from "../../../helpers/discord";
import { LineConsolidator } from "../../../lib/LineConsolidator";
import { prefabArguments } from "../../../lib/context/arguments/prefabArguments";
import { ArgumentsMap } from "../../../lib/context/arguments/types";
import { displayNumber } from "../../../lib/views/displays";
import { ServiceRegistry } from "../../../services/ServicesRegistry";
import { RedirectsService } from "../../../services/dbservices/RedirectsService";
import { CrownsChildCommand } from "./CrownsChildCommand";

const args = {
  ...prefabArguments.artist,
} satisfies ArgumentsMap;

export class Info extends CrownsChildCommand<typeof args> {
  idSeed = "wjsn dayoung";

  aliases = ["wh", "whohas"];
  description = "Shows who has the crown for a given user";
  usage = ["", "artist"];

  arguments = args;

  slashCommand = true;
  slashCommandName = "whohas";

  redirectsService = ServiceRegistry.get(RedirectsService);

  async run() {
    const { senderUser, senderRequestable } = await this.getMentions({
      usernameRequired: !this.parsedArguments.artist,
    });

    const artist = await this.lastFMArguments.getArtist(
      this.ctx,
      senderRequestable
    );

    const artistDetails = await this.lastFMService.artistInfo(
      this.ctx,
      senderRequestable
        ? {
            artist,
            username: senderRequestable,
          }
        : { artist }
    );

    const redirectArtistName =
      (await this.redirectsService.getRedirect(this.ctx, artistDetails.name))
        ?.to || artistDetails.name;

    const crown = await this.crownsService.getCrown(
      this.ctx,
      redirectArtistName,
      {
        showDeleted: false,
        noRedirect: true,
      }
    );

    if (!crown) {
      if (
        await this.crownsService.isArtistCrownBanned(
          this.ctx,
          redirectArtistName
        )
      ) {
        throw new ArtistIsCrownBannedError(redirectArtistName);
      }

      await this.handleNoCrown(
        senderUser,
        redirectArtistName,
        artistDetails.userPlaycount,
        redirectArtistName !== artistDetails.name
          ? artistDetails.name
          : undefined
      );

      return;
    }

    const invalidCheck = await this.crownsService.isCrownInvalid(
      this.ctx,
      crown
    );

    const invalidBadge = createInvalidBadge(invalidCheck.reason);

    if (crown.user.id === senderUser?.id && artistDetails.userPlaycount) {
      crown.plays = artistDetails.userPlaycount;
      crown.save();
    } else if (crown.user.lastFMUsername) {
      await crown.refresh({ logger: this.logger });
    }

    if (crown.user.id) {
      const holderUsername = await this.fetchUsername(crown.user.discordID);

      const embed = this.newEmbed()
        .setAuthor(this.generateEmbedAuthor("Crown info"))
        .setTitle(
          `Who has ${bold(crown.artistName)}?` + crown.redirectDisplay()
        )
        .setDescription(
          `${holderUsername}${invalidBadge} has the crown for ${bold(
            crown.artistName
          )} with ${displayNumber(crown.plays, "play")}

          Created ${ago(crown.createdAt)}${
            crown.version > 1 ? ". Last stolen " + ago(crown.lastStolen) : ""
          }

          _It ${
            crown.version === 0
              ? "has never been stolen"
              : "has been stolen " + displayNumber(crown.version, "time")
          }_`
        );

      await this.send(embed);
    }
  }

  private async handleNoCrown(
    senderUser: User | undefined,
    artistName: string,
    playcount?: number,
    redirectedFrom?: string
  ) {
    const lineConsolidator = new LineConsolidator();

    const userCanClaimCrowns = !senderUser
      ? false
      : await this.crownsUserService.canUserClaimCrowns(
          this.ctx,
          senderUser.discordID
        );

    lineConsolidator.addLines(
      `No one has the crown for ${bold(artistName)}` +
        (redirectedFrom ? ` _(redirected from ${redirectedFrom})_` : ""),
      {
        shouldDisplay:
          !!playcount &&
          playcount > this.crownsService.threshold &&
          userCanClaimCrowns,
        string: `\nYou can claim it with \`${this.prefix}c ${artistName}\``,
        else: userCanClaimCrowns
          ? `\nYou need ${displayNumber(
              this.crownsService.threshold,
              "play"
            )} to claim it`
          : `\nYou can't claim this crown`,
      }
    );

    const embed = this.newEmbed()
      .setAuthor(this.generateEmbedAuthor("Crown info"))
      .setTitle(`Who has ${bold(artistName)}?`)
      .setDescription(lineConsolidator.consolidate());

    await this.send(embed);
  }
}
