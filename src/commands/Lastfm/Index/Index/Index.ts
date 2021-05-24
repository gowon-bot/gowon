import { IndexerError, LogicError } from "../../../../errors";
import { ConfirmationEmbed } from "../../../../lib/views/embeds/ConfirmationEmbed";
import { Arguments } from "../../../../lib/arguments/arguments";
import {
  ConcurrencyManager,
  ConcurrentActions,
} from "../../../../lib/caches/ConcurrencyManager";
import { IndexingBaseCommand } from "../../../../lib/indexing/IndexingCommand";
import { Validation } from "../../../../lib/validation/ValidationChecker";
import { validators } from "../../../../lib/validation/validators";
import { IndexingService } from "../../../../services/indexing/IndexingService";
import {
  IndexUserParams,
  IndexUserResponse,
  IndexUserConnector,
} from "./Index.connector";

const args = {
  inputs: {},
} as const;

export default class Index extends IndexingBaseCommand<
  IndexUserResponse,
  IndexUserParams,
  typeof args
> {
  connector = new IndexUserConnector();

  aliases = ["fullindex"];

  idSeed = "iz*one yujin";

  description =
    "Fully index a user, deleting any previous data and replacing it";
  secretCommand = true;

  rollout = {
    guilds: this.indexerGuilds,
  };

  indexingService = new IndexingService();

  arguments: Arguments = args;

  validation: Validation = {
    username: new validators.Required({}),
  };

  concurrencyManager = new ConcurrencyManager();

  async prerun() {
    if (
      await this.concurrencyManager.isUserDoingAction(
        this.author.id,
        ConcurrentActions.Indexing,
        ConcurrentActions.Updating
      )
    ) {
      throw new LogicError(
        "You are already being updated or indexed, please wait until you are done!"
      );
    }
  }

  async run() {
    const { senderUsername } = await this.parseMentions();

    this.indexingService.quietAddUserToGuild(this.author.id, this.guild.id);

    const indexingUsername = senderUsername;

    const perspective = this.usersService.perspective(
      senderUsername,
      indexingUsername
    );

    const embed = this.newEmbed()
      .setAuthor(...this.generateEmbedAuthor("Indexing"))
      .setDescription(
        "Indexing will delete all your data, and re-download it. Are you sure you want to full index?"
      )
      .setFooter(this.indexingHelp);

    const confirmationEmbed = new ConfirmationEmbed(
      this.message,
      embed,
      this.gowonClient
    );

    if (!(await confirmationEmbed.awaitConfirmation())) {
      return;
    } else {
      confirmationEmbed.sentMessage?.edit(
        embed.setDescription(this.indexingInProgressHelp)
      );
    }

    let response = await this.query({
      user: { lastFMUsername: indexingUsername, discordID: this.author.id },
      guildID: this.guild.id,
      discordID: this.author.id,
    });

    const errors = this.parseErrors(response);

    if (errors) {
      throw new IndexerError("An unknown error occurred");
    }

    this.concurrencyManager.registerUser(
      ConcurrentActions.Indexing,
      this.author.id
    );

    this.indexingService.webhook.onResponse(response.fullIndex.token, () => {
      this.concurrencyManager.unregisterUser(
        ConcurrentActions.Indexing,
        this.author.id
      );
      this.usersService.setAsIndexed(this.author.id);
      this.notifyUser(perspective, "index");
    });
  }
}
