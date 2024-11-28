import fetch from "node-fetch";
import streamToString from "stream-to-string";
import {
  NoRatingsFileAttatchedError,
  TooManyAttachmentsError,
  WrongFileFormatAttachedError,
} from "../../../errors/commands/library";
import { CannotBeUsedAsASlashCommand } from "../../../errors/errors";
import { StringArgument } from "../../../lib/context/arguments/argumentTypes/StringArgument";
import { ArgumentsMap } from "../../../lib/context/arguments/types";
import { WarningEmbed } from "../../../lib/ui/embeds/WarningEmbed";
import { RatingsImportProgressView } from "../../../lib/ui/views/RatingsImportProgressView";
import { RateYourMusicChildCommand } from "./RateYourMusicChildCommand";

const args = {
  input: new StringArgument({ index: { start: 0 }, slashCommandOption: false }),
} satisfies ArgumentsMap;

export class ImportRatings extends RateYourMusicChildCommand<typeof args> {
  idSeed = "sonamoo high d";
  aliases = ["rymimport", "rymsimport"];
  description =
    "Import your rateyourmusic ratings. See ryms help for more info on how to import";

  arguments = args;

  slashCommand = true;

  async run() {
    if (this.payload.isInteraction()) {
      await this.reply(
        new WarningEmbed().setDescription(
          `As of right now, you cannot import with slash commands.\n\nPlease use the message command \`${this.prefix}rymimport\``
        )
      );

      return;
    }

    await this.getMentions({
      senderRequired: true,
      syncedRequired: true,
    });

    const ratings = await this.getRatings();

    const ratingsProgress = this.lilacRatingsService.importProgress(this.ctx, {
      discordID: this.author.id,
    });

    const embed = this.minimalEmbed().setDescription(`Preparing import...`);

    await this.reply(embed);

    const syncProgressView = new RatingsImportProgressView(
      this.ctx,
      embed,
      ratingsProgress
    );

    syncProgressView.subscribeToObservable();

    await this.lilacRatingsService.import(this.ctx, ratings, {
      discordID: this.author.id,
    });
  }

  private async getRatings(): Promise<string> {
    let ratings: string;

    if (!this.parsedArguments.input) {
      ratings = await this.getRatingsFromAttached();
    } else {
      ratings = this.getRatingsFromContent();
    }

    ratings = ratings.trim();

    if (!ratings.startsWith("RYM Album,")) {
      throw new WrongFileFormatAttachedError();
    }

    return ratings;
  }

  private async getRatingsFromAttached(): Promise<string> {
    if (this.payload.isInteraction()) {
      throw new CannotBeUsedAsASlashCommand();
    } else if (this.payload.isMessage()) {
      const attachments = this.payload.source.attachments;

      if (attachments.size > 1) {
        throw new TooManyAttachmentsError();
      }

      const attachment = attachments.first();

      if (!attachment) {
        throw new NoRatingsFileAttatchedError(this.prefix);
      }

      const file = await fetch(attachment.url);

      const fileContent = await streamToString(file.body);

      return fileContent;
    }

    return "";
  }

  private getRatingsFromContent(): string {
    if (this.payload.isInteraction()) {
      throw new CannotBeUsedAsASlashCommand();
    } else if (this.payload.isMessage()) {
      const rawMessageContent = this.gowonService.removeCommandName(
        this.ctx,
        this.payload.source.content
      );

      return rawMessageContent;
    }

    return "";
  }
}
