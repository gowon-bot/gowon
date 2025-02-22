import { Observable, ObservableSubscription } from "@apollo/client";
import { Stopwatch } from "../../../helpers";
import { code } from "../../../helpers/discord";
import { ServiceRegistry } from "../../../services/ServicesRegistry";
import { UsersService } from "../../../services/dbservices/UsersService";
import {
  ErroredSyncProgress,
  LilacProgressAction,
  LilacProgressStage,
  SuccessfulSyncProgress,
  SyncProgress,
} from "../../../services/lilac/LilacAPIService.types";
import { LilacBaseCommand } from "../../Lilac/LilacBaseCommand";
import { GowonContext } from "../../context/Context";
import { Emoji } from "../../emoji/Emoji";
import {
  displayErrorredProgressBar,
  displayNumber,
  displayProgressBar,
} from "../displays";
import { errorColour } from "../embeds/ErrorEmbed";
import { SuccessEmbed } from "../embeds/SuccessEmbed";
import { EmbedView } from "./EmbedView";
import { UnsendableView } from "./View";

export class SyncingProgressView extends UnsendableView {
  private stopwatch = new Stopwatch();
  private subscription?: ObservableSubscription;
  private currentProgress: SuccessfulSyncProgress | undefined;

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
    if (progress.stage === LilacProgressStage.Terminated) {
      await this.handleTermination(progress as ErroredSyncProgress);
    } else if (
      progress.stage == LilacProgressStage.Inserting &&
      progress.current === progress.total
    ) {
      await this.handleInsertingComplete(progress);
    } else if (this.stopwatch.elapsedInMilliseconds >= 3000) {
      await this.handleProgressUpdate(progress);
    }
  }

  private async handleProgressUpdate(progress: SuccessfulSyncProgress) {
    const { current, total, action, stage } = this.cacheProgress(progress);

    await this.embed
      .setDescription(
        `${this.getActionVerb(action)}...
${this.displayProgressBar(progress)}
*${displayNumber(current)}/${displayNumber(total)} ${
          stage === LilacProgressStage.Fetching
            ? "scrobbles fetched"
            : "counts inserted"
        }*`
      )
      .setFooter(this.getFooterMessage())
      .editMessage(this.ctx);

    this.stopwatch.zero().start();
  }

  private async handleInsertingComplete(progress: SyncProgress) {
    await this.usersService.setIndexed(this.ctx, this.ctx.author.id);
    await this.embed
      .convert(SuccessEmbed)
      .setDescription(this.getInsertingCompleteMessage(progress))
      .editMessage(this.ctx);

    this.subscription?.unsubscribe();
  }

  private async handleTermination(progress: ErroredSyncProgress) {
    this.subscription?.unsubscribe();

    if (progress.error) {
      await this.embed
        .setColour(errorColour)
        .setDescription(
          `${this.getActionVerb(progress.action)}...
${
  this.currentProgress
    ? this.displayProgressBar(this.currentProgress, Emoji.evilProgress)
    : displayErrorredProgressBar(LilacBaseCommand.progressBarWidth)
}
_An error occurred${
            progress.supernova_id ? `: ${code(progress.supernova_id)}` : ""
          }_
`
        )
        .setFooter(this.getFooterMessage())
        .editMessage(this.ctx);
    }
  }

  private getInsertingCompleteMessage(progress: SyncProgress): string {
    return progress.action === LilacProgressAction.Syncing
      ? `Successfully synced your Last.fm data!`
      : `Successfully updated your synced data!`;
  }

  private getFooterMessage(): string {
    return `Syncing means downloading all your Last.fm data. This is required for many commands to function.`;
  }

  private cacheProgress(
    currentProgress: SuccessfulSyncProgress
  ): SuccessfulSyncProgress {
    this.currentProgress = currentProgress;

    return currentProgress;
  }

  private getActionVerb(action: LilacProgressAction): string {
    return action === LilacProgressAction.Syncing ? "Syncing" : "Updating";
  }

  private displayProgressBar(
    { current, total, stage }: SuccessfulSyncProgress,
    overrideProgressEmoji?: string
  ): string {
    return displayProgressBar(current, total, {
      width: LilacBaseCommand.progressBarWidth,
      progressEmoji:
        overrideProgressEmoji ??
        (stage === LilacProgressStage.Fetching
          ? Emoji.progress
          : Emoji.moreProgress),
      remainingEmoji:
        stage === LilacProgressStage.Fetching
          ? Emoji.remainingProgress
          : Emoji.progress,
    });
  }
}
