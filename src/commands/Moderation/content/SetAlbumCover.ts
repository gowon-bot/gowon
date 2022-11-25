import { MustBeAPatronError } from "../../../errors/permissions";
import { bold, italic } from "../../../helpers/discord";
import { Flag } from "../../../lib/context/arguments/argumentTypes/Flag";
import { StringArgument } from "../../../lib/context/arguments/argumentTypes/StringArgument";
import { prefabArguments } from "../../../lib/context/arguments/prefabArguments";
import { ArgumentsMap } from "../../../lib/context/arguments/types";
import { ConfirmationEmbed } from "../../../lib/views/embeds/ConfirmationEmbed";
import { LastFMArguments } from "../../../services/LastFM/LastFMArguments";
import { AlbumCoverService } from "../../../services/moderation/AlbumCoverService";
import { ServiceRegistry } from "../../../services/ServicesRegistry";
import { ContentModerationCommand } from "./ContentModerationCommand";

const args = {
  ...prefabArguments.album,
  url: new StringArgument({
    splitOn: "|",
    index: 2,
    description: "The url to set as the alternate",
    required: true,
  }),
  moderation: new Flag({
    description: "Replace an album cover bot wide (content moderators only)",
    shortnames: ["m", "mod"],
    longnames: ["moderation"],
  }),
} satisfies ArgumentsMap;

export default class SetAlbumCover extends ContentModerationCommand<
  typeof args
> {
  idSeed = "brave girls yujeong";

  category = "content moderation";
  description = "Set an alternate album cover";

  secretCommand = true;
  adminCommand = true;

  arguments = args;

  usage = ["artist | album | url", "|| url", "artist | album | clear"];

  lastFMArguments = ServiceRegistry.get(LastFMArguments);
  albumCoverService = ServiceRegistry.get(AlbumCoverService);

  async run() {
    const { dbUser, requestable } = await this.getMentions({
      senderRequired: true,
    });

    if (this.parsedArguments.moderation) {
      this.access.checkAndThrow(dbUser);
    } else {
      if (!dbUser.isPatron) {
        throw new MustBeAPatronError();
      }
    }

    const { artist, album } = await this.lastFMArguments.getAlbum(
      this.ctx,
      requestable,
      { redirect: true }
    );

    const existingCover = await this.albumCoverService.getAlternateCover(
      this.ctx,
      artist,
      album,
      this.parsedArguments.moderation
    );

    const embed = this.newEmbed()
      .setAuthor(this.generateEmbedAuthor("Set album cover"))
      .setDescription(
        `${existingCover ? "This album already has an alternate cover. " : ""
        }Are you sure you want to ${this.parsedArguments.url === "clear" ? "clear" : "set this as"
        } the image for ${bold(artist)} | ${italic(album)}?
        
This will set the image ${bold(
          this.parsedArguments.moderation ? "bot-wide" : "for you only"
        )}.`
      )
      .setImage(
        this.parsedArguments.url !== "clear" ? this.parsedArguments.url : ""
      )
      .setThumbnail(existingCover?.url || "");

    const confirmationEmbed = new ConfirmationEmbed(
      this.ctx,
      embed,
      this.ctx.payload
    ).withRejectionReact();

    if (!(await confirmationEmbed.awaitConfirmation(this.ctx))) {
      return;
    }

    await this.albumCoverService.setAlternate(
      this.ctx,
      artist,
      album,
      this.parsedArguments.url === "clear"
        ? undefined
        : this.parsedArguments.url,
      this.parsedArguments.moderation ? undefined : dbUser
    );

    await this.discordService.edit(
      this.ctx,
      confirmationEmbed.sentMessage!,
      embed.setDescription(
        `${this.parsedArguments.url === "clear" ? "Cleared" : "Set this as"
        } the image for ${bold(artist)} | ${italic(album)}${this.parsedArguments.moderation ? " bot-wide" : ""
        }!`
      )
    );
  }
}
