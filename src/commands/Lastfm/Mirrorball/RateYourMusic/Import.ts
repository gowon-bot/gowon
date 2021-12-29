import { AlreadyImportingRatingsError, LogicError } from "../../../../errors";
import { Arguments } from "../../../../lib/arguments/arguments";
import {
  ImportRatingsConnector,
  ImportRatingsParams,
  ImportRatingsResponse,
} from "./connectors";
import streamToString from "stream-to-string";
import { Emoji } from "../../../../lib/Emoji";
import { RateYourMusicIndexingChildCommand } from "./RateYourMusicChildCommand";
import fetch from "node-fetch";
import { ConcurrentAction } from "../../../../services/ConcurrencyService";

const args = {
  inputs: {
    input: { index: { start: 0 } },
  },
} as const;

export class ImportRatings extends RateYourMusicIndexingChildCommand<
  ImportRatingsResponse,
  ImportRatingsParams,
  typeof args
> {
  connector = new ImportRatingsConnector();

  idSeed = "sonamoo high d";
  aliases = ["rymimport", "rymsimport"];
  description = "Import your rateyourmusic ratings";

  arguments: Arguments = args;

  async prerun() {
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
    await this.parseMentions({
      senderRequired: true,
      requireIndexed: true,
    });

    const ratings = await this.getRatings();

    this.message.react(Emoji.loading);

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

    await this.send(Emoji.gowonRated, embed);
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
    const attachments = this.message.attachments;

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

  private getRatingsFromContent(): string {
    const rawMessageContent = this.gowonService.removeCommandName(
      this.message.content,
      this.runAs,
      this.guild.id
    );

    return rawMessageContent;
  }

  private unregisterConcurrency() {
    this.concurrencyService.unregisterUser(
      this.ctx,
      ConcurrentAction.RYMImport,
      this.author.id
    );
  }
}
