import { MustBeAPatronError } from "../../../errors/commands/permissions";
import { bold, italic } from "../../../helpers/discord";
import { Flag } from "../../../lib/context/arguments/argumentTypes/Flag";
import { ImageArgument } from "../../../lib/context/arguments/argumentTypes/ImageArgument";
import { StringArgument } from "../../../lib/context/arguments/argumentTypes/StringArgument";
import { URLParser } from "../../../lib/context/arguments/parsers/URLParser";
import { ArgumentsMap } from "../../../lib/context/arguments/types";
import { ConfirmationView } from "../../../lib/ui/views/ConfirmationView";
import { ArgumentValidationError } from "../../../lib/validation/validators/BaseValidator";
import { LastFMArguments } from "../../../services/LastFM/LastFMArguments";
import { ServiceRegistry } from "../../../services/ServicesRegistry";
import { AlbumCoverService } from "../../../services/moderation/AlbumCoverService";
import { ContentModerationCommand } from "./ContentModerationCommand";

const args = {
  artist: new StringArgument({
    splitOn: "|",
    description:
      "The artist to use (defaults to your currently playing artist)",
    preprocessor: URLParser.removeURLsFromString,
  }),
  album: new StringArgument({
    splitOn: "|",
    index: 1,
    description: "The album to use (defaults to your currently playing album)",
    preprocessor: URLParser.removeURLsFromString,
  }),
  clear: new StringArgument({
    splitOn: "|",
    index: 2,
    preprocessor: URLParser.removeURLsFromString,
  }),
  image: new ImageArgument({
    description: "The image to set as the alternate (URL or file upload)",
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
    const image = (this.parsedArguments.image || [])[0],
      shouldClear = this.parsedArguments.clear === "clear";

    if (!shouldClear && !image) {
      throw new ArgumentValidationError(`Please enter an image!`);
    }

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

    const embed = this.authorEmbed()
      .setHeader("Set album cover")
      .setDescription(
        `${
          existingCover
            ? `This album ${
                shouldClear ? "" : "already "
              }has an alternate cover. `
            : ""
        }Are you sure you want to ${
          shouldClear ? "clear" : "set this as"
        } the image for ${bold(artist)} | ${italic(album)}?
        
This will ${shouldClear ? "clear" : "set"} the image ${bold(
          this.parsedArguments.moderation ? "bot-wide" : "for you only"
        )}.`
      )
      .setImage(!shouldClear ? image.asURL() : "")
      .setThumbnail(existingCover?.url || "");

    const confirmationEmbed = new ConfirmationView(
      this.ctx,
      embed,
      this.ctx.payload
    ).withRejectionReact();

    if (!(await confirmationEmbed.awaitConfirmation(this.ctx))) {
      return;
    }

    const user = this.parsedArguments.moderation ? undefined : dbUser;

    if (shouldClear) {
      await this.albumCoverService.clearAlternate(
        this.ctx,
        artist,
        album,
        user
      );
    } else {
      await this.albumCoverService.setAlternate(
        this.ctx,
        image.withMetadata({ artist, album }),
        user
      );
    }

    await embed
      .setDescription(
        `${shouldClear ? "Cleared" : "Set this as"} the image for ${bold(
          artist
        )} | ${italic(album)}${
          this.parsedArguments.moderation ? " bot-wide" : ""
        }!`
      )
      .updateMessage(this.ctx);
  }
}
