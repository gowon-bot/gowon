import fetch from "node-fetch";
import streamToString from "stream-to-string";
import {
  NoRatingsFileAttatchedError,
  TooManyAttachmentsError,
  UnknownRatingsImportError,
  WrongFileFormatAttachedError,
} from "../../../../errors/commands/library";
import { CannotBeUsedAsASlashCommand } from "../../../../errors/errors";
import { AlreadyImportingRatingsError } from "../../../../errors/external/rateYourMusic";
import { StringArgument } from "../../../../lib/context/arguments/argumentTypes/StringArgument";
import { ArgumentsMap } from "../../../../lib/context/arguments/types";
import { Emoji } from "../../../../lib/emoji/Emoji";
import { SuccessEmbed } from "../../../../lib/ui/embeds/SuccessEmbed";
import { WarningEmbed } from "../../../../lib/ui/embeds/WarningEmbed";
import { ConcurrentAction } from "../../../../services/ConcurrencyService";
import { RateYourMusicIndexingChildCommand } from "./RateYourMusicChildCommand";
import {
  ImportRatingsConnector,
  ImportRatingsParams,
  ImportRatingsResponse,
} from "./connectors";

const args = {
  input: new StringArgument({ index: { start: 0 }, slashCommandOption: false }),
} satisfies ArgumentsMap;

export class ImportRatings extends RateYourMusicIndexingChildCommand<
  ImportRatingsResponse,
  ImportRatingsParams,
  typeof args
> {
  connector = new ImportRatingsConnector();

  idSeed = "sonamoo high d";
  aliases = ["rymimport", "rymsimport"];
  description =
    "Import your rateyourmusic ratings. See ryms help for more info on how to import";

  arguments = args;

  slashCommand = true;

  async beforeRun() {
    if (
      await this.concurrencyService.isUserDoingAction(
        this.author.id,
        ConcurrentAction.RYMImport
      )
    ) {
      throw new AlreadyImportingRatingsError();
    }
  }

  async run() {
    if (this.payload.isInteraction()) {
      await this.reply(
        new WarningEmbed().setDescription(
          "As of right now, you cannot import with slash commands.\n\nPlease go to https://gowon.bot/import-ratings to import, or use message commands"
        )
      );

      return;
    }

    await this.getMentions({
      senderRequired: true,
      indexedRequired: true,
    });

    const ratings = await this.getRatings();

    if (this.payload.isMessage()) {
      this.payload.source.react(Emoji.loading);
    }

    this.concurrencyService.registerUser(
      this.ctx,
      ConcurrentAction.RYMImport,
      this.author.id
    );

    let response: ImportRatingsResponse;

    try {
      response = await this.query({
        csv: ratings,
        user: { discordID: this.author.id },
      });
      this.unregisterConcurrency();
    } catch (e) {
      this.unregisterConcurrency();
      throw e;
    }

    const errors = this.parseErrors(response);

    if (errors) {
      throw new UnknownRatingsImportError();
    }

    const embed = new SuccessEmbed().setDescription(
      `RateYourMusic ratings imported succesfully! ${Emoji.gowonRated}`
    );

    await this.reply(embed);
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

  private unregisterConcurrency() {
    this.concurrencyService.unregisterUser(
      this.ctx,
      ConcurrentAction.RYMImport,
      this.author.id
    );
  }
}
