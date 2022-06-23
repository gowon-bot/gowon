import {
  MirrorballError,
  LogicError,
  IndexingDisabledBecauseOfIssueModeError,
} from "../../../../errors/errors";
import { ConfirmationEmbed } from "../../../../lib/views/embeds/ConfirmationEmbed";
import {
  ConcurrencyService,
  ConcurrentAction,
} from "../../../../services/ConcurrencyService";
import { MirrorballBaseCommand as MirrorballBaseCommand } from "../../../../lib/indexing/MirrorballCommands";
import {
  IndexUserParams,
  IndexUserResponse,
  IndexUserConnector,
} from "./Index.connector";
import { ServiceRegistry } from "../../../../services/ServicesRegistry";
import { LilacUsersService } from "../../../../services/lilac/LilacUsersService";
import { displayProgressBar } from "../../../../lib/views/displays";
import { Stopwatch } from "../../../../helpers";
import { BetaAccess } from "../../../../lib/command/access/access";

export default class Index extends MirrorballBaseCommand<
  IndexUserResponse,
  IndexUserParams
> {
  connector = new IndexUserConnector();

  subcategory = "library";
  aliases = ["fullindex"];

  slashCommand = true;

  idSeed = "iz*one yujin";

  description = "Fully index a user, downloading all your Last.fm data";

  concurrencyService = ServiceRegistry.get(ConcurrencyService);
  lilacUsersService = ServiceRegistry.get(LilacUsersService);

  async beforeRun() {
    if (
      await this.concurrencyService.isUserDoingAction(
        this.author.id,
        ConcurrentAction.Indexing,
        ConcurrentAction.Updating
      )
    ) {
      throw new LogicError(
        "You are already being updated or indexed, please wait until you are done!"
      );
    }

    if (this.gowonClient.isInIssueMode) {
      throw new IndexingDisabledBecauseOfIssueModeError();
    }
  }

  async run() {
    const { senderUsername, senderUser } = await this.getMentions({
      authentificationRequired: true,
    });

    this.mirrorballUsersService.quietAddUserToGuild(
      this.ctx,
      this.author.id,
      this.requiredGuild.id
    );

    const access = new BetaAccess();

    if (access.check(senderUser)) {
      await this.lilacIndex();

      return;
    }

    const indexingUsername = senderUsername;

    const perspective = this.usersService.perspective(
      senderUsername,
      indexingUsername
    );

    const embed = this.newEmbed()
      .setAuthor(this.generateEmbedAuthor("Indexing"))
      .setDescription(
        "Indexing will download all your scrobbles from Last.fm. Are you sure you want to full index?"
      )
      .setFooter({ text: this.indexingHelp });

    const confirmationEmbed = new ConfirmationEmbed(this.ctx, embed);

    if (!(await confirmationEmbed.awaitConfirmation(this.ctx))) {
      return;
    } else {
      confirmationEmbed.sentMessage?.edit({
        embeds: [embed.setDescription(this.indexingInProgressHelp)],
      });
    }

    let response = await this.query({
      user: { lastFMUsername: indexingUsername, discordID: this.author.id },
      guildID: this.requiredGuild.id,
      discordID: this.author.id,
    });

    const errors = this.parseErrors(response);

    if (errors) {
      throw new MirrorballError("An unknown error occurred");
    }

    this.concurrencyService.registerUser(
      this.ctx,
      ConcurrentAction.Indexing,
      this.author.id
    );

    this.mirrorballUsersService.webhook.onResponse(
      response.fullIndex.token,
      () => {
        this.concurrencyService.unregisterUser(
          this.ctx,
          ConcurrentAction.Indexing,
          this.author.id
        );
        this.usersService.setAsIndexed(this.ctx, this.author.id);
        this.notifyUser(perspective, "index");
      }
    );
  }

  private async lilacIndex() {
    await this.lilacUsersService.index({ discordID: this.author.id });

    const observable = this.lilacUsersService.indexingProgress({
      discordID: this.author.id,
    });

    const embed = this.newEmbed()
      .setAuthor(this.generateEmbedAuthor("Lilac indexing"))
      .setDescription("Started your indexing!");

    const sentMessage = await this.send(embed);

    const stopwatch = new Stopwatch().start();

    const subscription = observable.subscribe(async (progress) => {
      if (progress.page === progress.totalPages) {
        await this.discordService.edit(
          this.ctx,
          sentMessage,
          embed.setDescription("Done!")
        );
        subscription.unsubscribe();
      } else if (stopwatch.elapsedInMilliseconds >= 3000) {
        await this.discordService.edit(
          this.ctx,
          sentMessage,
          embed.setDescription(
            `Indexing...
${displayProgressBar(progress.page, progress.totalPages, { width: 15 })}
*Page ${progress.page}/${progress.totalPages}*`
          )
        );

        stopwatch.zero().start();
      }
    });
  }
}
