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

  async prerun() {
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
    const { senderUsername } = await this.getMentions({
      authentificationRequired: true,
    });

    this.mirrorballUsersService.quietAddUserToGuild(
      this.ctx,
      this.author.id,
      this.requiredGuild.id
    );

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
}
