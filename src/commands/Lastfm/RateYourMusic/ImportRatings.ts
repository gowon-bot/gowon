import fetch from "node-fetch";
import streamToString from "stream-to-string";
import { WrongFileFormatAttachedError } from "../../../errors/commands/library";
import { AttachmentArgument } from "../../../lib/context/arguments/argumentTypes/discord/AttachmentArgument";
import { ArgumentsMap } from "../../../lib/context/arguments/types";
import { RatingsImportProgressView } from "../../../lib/ui/views/RatingsImportProgressView";
import { RateYourMusicChildCommand } from "./RateYourMusicChildCommand";

const args = {
  ratings: new AttachmentArgument({
    index: 0,
    description: "The file containing your RateYourMusic ratings",
    required: true,
  }),
} satisfies ArgumentsMap;

export class ImportRatings extends RateYourMusicChildCommand<typeof args> {
  idSeed = "sonamoo high d";
  aliases = ["rymimport", "rymsimport"];
  description =
    "Import your RateYourMusic ratings. See rym help for more info on how to import";

  arguments = args;

  slashCommand = true;

  async run() {
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
    const ratingsAttachment = this.parsedArguments.ratings;

    const file = await fetch(ratingsAttachment.url);

    const fileContent = await streamToString(file.body);

    const ratings = fileContent.trim();

    if (!ratings.startsWith("RYM Album,")) {
      throw new WrongFileFormatAttachedError();
    }

    return ratings;
  }
}
