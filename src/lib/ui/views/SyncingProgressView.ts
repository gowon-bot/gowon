import { Observable, ObservableSubscription } from "@apollo/client";
import { Stopwatch } from "../../../helpers";
import { ServiceRegistry } from "../../../services/ServicesRegistry";
import { UsersService } from "../../../services/dbservices/UsersService";
import {
  LilacProgressAction,
  LilacProgressStage,
  SyncProgress,
} from "../../../services/lilac/LilacAPIService.types";
import { LilacBaseCommand } from "../../Lilac/LilacBaseCommand";
import { GowonContext } from "../../context/Context";
import { Emoji } from "../../emoji/Emoji";
import { displayNumber, displayProgressBar } from "../displays";
import { SuccessEmbed } from "../embeds/SuccessEmbed";
import { EmbedView } from "./EmbedView";
import { UnsendableView } from "./View";

export class SyncingProgressView extends UnsendableView {
  private stopwatch = new Stopwatch();
  private subscription?: ObservableSubscription;

  private get usersService() {
    return ServiceRegistry.get(UsersService);
  }

  constructor(
    private ctx: GowonContext,
    private embed: EmbedView,
    private observable: Observable<SyncProgress>
  ) {
    super();
  }

  public subscribeToObservable(sendInitialMessage = true): this {
    this.stopwatch.start();

    this.subscription = this.observable.subscribe(async (progress) => {
      await this.handleProgress(progress);
    });

    if (sendInitialMessage) {
      this.embed
        .setDescription(
          `Syncing...\n${displayProgressBar(0, 1, {
            width: LilacBaseCommand.progressBarWidth,
          })}\n*Loading...*`
        )
        .editMessage(this.ctx);
    }

    return this;
  }

  private async handleProgress(progress: SyncProgress) {
    if (
      progress.current === progress.total &&
      progress.stage == LilacProgressStage.Inserting
    ) {
      await this.handleInsertingComplete(progress);
    } else if (this.stopwatch.elapsedInMilliseconds >= 3000) {
      await this.handleProgressUpdate(progress);
    }
  }

  private async handleInsertingComplete(progress: SyncProgress) {
    await this.usersService.setIndexed(this.ctx, this.ctx.author.id);
    await this.embed
      .convert(SuccessEmbed)
      .setDescription(this.getInsertingCompleteMessage(progress))
      .editMessage(this.ctx);

    this.subscription?.unsubscribe();
  }

  private async handleProgressUpdate(progress: SyncProgress) {
    await this.embed
      .setDescription(
        `${
          progress.action === LilacProgressAction.Syncing
            ? "Syncing"
            : "Updating"
        }...
${displayProgressBar(progress.current, progress.total, {
  width: LilacBaseCommand.progressBarWidth,
  progressEmoji:
    progress.stage === LilacProgressStage.Fetching
      ? Emoji.progress
      : Emoji.moreProgress,
  remainingEmoji:
    progress.stage === LilacProgressStage.Fetching
      ? Emoji.remainingProgress
      : Emoji.progress,
})}
*${displayNumber(progress.current)}/${displayNumber(progress.total)} ${
          progress.stage === LilacProgressStage.Fetching
            ? "scrobbles fetched"
            : "counts inserted"
        }*`
      )
      .setFooter(this.getFooterMessage())
      .editMessage(this.ctx);

    this.stopwatch.zero().start();
  }

  private getInsertingCompleteMessage(progress: SyncProgress): string {
    return progress.action === LilacProgressAction.Syncing
      ? `Successfully synced your Last.fm data!`
      : `Successfully updated your synced data!`;
  }

  private getFooterMessage(): string {
    return `Syncing means downloading all your Last.fm data. This is required for many commands to function.`;
  }
}
