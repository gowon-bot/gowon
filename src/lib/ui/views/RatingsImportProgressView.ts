import { Observable, ObservableSubscription } from "@apollo/client";
import { italic } from "../../../helpers/discord";
import {
  LilacRatingsImportStage,
  RatingsImportProgress,
} from "../../../services/lilac/LilacAPIService.types";
import { GowonContext } from "../../context/Context";
import { Emoji } from "../../emoji/Emoji";
import { displayNumber } from "../displays";
import { ErrorEmbed } from "../embeds/ErrorEmbed";
import { SuccessEmbed } from "../embeds/SuccessEmbed";
import { EmbedView } from "./EmbedView";
import { UnsendableView } from "./View";

export class RatingsImportProgressView extends UnsendableView {
  private subscription: ObservableSubscription | undefined;

  constructor(
    private ctx: GowonContext,
    private embed: EmbedView,
    private observable: Observable<RatingsImportProgress>
  ) {
    super();
  }

  public subscribeToObservable(): this {
    this.subscription = this.observable.subscribe(async (progress) => {
      await this.handleProgress(progress);
    });

    return this;
  }

  private async handleProgress(progress: RatingsImportProgress) {
    if (progress.stage === LilacRatingsImportStage.Started) {
      this.embed
        .setDescription(
          `${Emoji.loading} Starting import of ${displayNumber(
            progress.count,
            "rating"
          )}...`
        )
        .editMessage(this.ctx);
    } else if (progress.stage === LilacRatingsImportStage.Finished) {
      this.embed
        .convert(SuccessEmbed)
        .setSuccessEmoji(Emoji.gowonRated)
        .setDescription(
          `Successfully imported ${displayNumber(progress.count, "rating")}!`
        )
        .editMessage(this.ctx);

      this.subscription?.unsubscribe();
    } else if (progress.stage === LilacRatingsImportStage.Errored) {
      this.embed
        .convert(ErrorEmbed)
        .setDescription(
          `Something went wrong importing your ratings:\n\n${italic(
            progress.error
          )}`
        )
        .editMessage(this.ctx);

      this.subscription?.unsubscribe();
    }
  }
}
