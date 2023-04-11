import fetch from "node-fetch";
import streamToString from "stream-to-string";
import {
  CannotBeUsedAsASlashCommand,
  LogicError,
} from "../../../../errors/errors";
import { AlreadyImportingRatingsError } from "../../../../errors/external/rateYourMusic";
import { StringArgument } from "../../../../lib/context/arguments/argumentTypes/StringArgument";
import { ArgumentsMap } from "../../../../lib/context/arguments/types";
import { Emoji } from "../../../../lib/emoji/Emoji";
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
      await this.send(
        this.newEmbed()
          .setAuthor(this.generateEmbedAuthor("Rateyourmusic import"))
          .setDescription(
            "As of right now, you cannot import with slash commands.\n\nPlease go to https://gowon.ca/import-ratings to import, or use message commands"
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
      throw new LogicError("Something went wrong when importing your ratings");
    }

    const embed = this.newEmbed()
      .setAuthor(this.generateEmbedAuthor("RateYourMusic import"))
      .setDescription(`Ratings processed succesfully!`);

    await this.send(Emoji.gowonRated, { withEmbed: embed });
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
      throw new LogicError("Please attach a file with the correct format");
    }

    return ratings;
  }

  private async getRatingsFromAttached(): Promise<string> {
    if (this.payload.isInteraction()) {
      throw new CannotBeUsedAsASlashCommand();
    } else if (this.payload.isMessage()) {
      const attachments = this.payload.source.attachments;

      if (attachments.size > 1) {
        throw new LogicError(
          "Too many attachments! Please attach only one file with your ratings"
        );
      }

      const attachment = attachments.first();

      if (!attachment) {
        throw new LogicError(
          `Please attach your ratings! (See \`${this.prefix}rym help\` for more info)`
        );
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
