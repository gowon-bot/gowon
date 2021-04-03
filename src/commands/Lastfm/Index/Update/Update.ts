import { IndexerError, LogicError } from "../../../../errors";
import { Stopwatch } from "../../../../helpers";
import {
  ConcurrencyManager,
  ConcurrentActions,
} from "../../../../lib/caches/ConcurrencyManager";
import { Delegate } from "../../../../lib/command/BaseCommand";
import { IndexingCommand } from "../../../../lib/indexing/IndexingCommand";
import {
  IndexerErrorResponses,
  responseHasError,
} from "../../../../services/indexing/IndexerErrorResposes";
import { IndexerTaskNames } from "../../../../services/indexing/IndexerTaskNames";
import { IndexingService } from "../../../../services/indexing/IndexingService";
import Index from "../Index/Index";
import {
  UpdateUserConnector,
  UpdateUserParams,
  UpdateUserResponse,
} from "./Update.connector";

const args = {
  inputs: {},
  mentions: {},
  flags: {
    full: {
      shortnames: [],
      longnames: ["full", "force"],
      description: "Deletes all of your indexed data and replaces it",
    },
  },
} as const;

export default class Update extends IndexingCommand<
  UpdateUserResponse,
  UpdateUserParams,
  typeof args
> {
  connector = new UpdateUserConnector();

  idSeed = "bvndit yiyeon";

  description = "Updates a user's cached data based on their lastest scrobbles";
  secretCommand = true;

  rollout = {
    guilds: ["768596255697272862"],
  };

  delegates: Delegate<typeof args>[] = [
    { when: (args) => args.full, delegateTo: Index },
  ];

  arguments = args;

  indexingService = new IndexingService(this.logger);

  stopwatch = new Stopwatch();

  concurrencyManager = new ConcurrencyManager();

  async prerun() {
    throw new LogicError("E");
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

    this.stopwatch.start();
    const response = await this.query({
      user: { lastFMUsername: senderUsername, discordID: this.author.id },
    });

    const errors = this.parseErrors(response);

    if (errors) {
      if (responseHasError(errors, IndexerErrorResponses.UserDoesntExist)) {
        throw new IndexerError(
          `Couldn't find you logged into the indexer, try running \`${this.prefix}login ${senderUsername}\` again`
        );
      } else {
        throw new IndexerError(errors.errors[0].message);
      }
    }

    await this.concurrencyManager.registerUser(
      ConcurrentActions.Updating,
      this.author.id
    );

    const sentMessage = await this.reply(
      `Updating user ${senderUsername.code()}` +
        (response.update.taskName === IndexerTaskNames.indexUser
          ? ". Since you haven't been fully indexed yet, this may take a while"
          : "")
    );

    this.indexingService.webhook.onResponse(response.update.token, () => {
      this.concurrencyManager.unregisterUser(
        ConcurrentActions.Indexing,
        this.author.id
      );
      if (this.stopwatch.elapsedInSeconds > 5) {
        this.reply(`Updated user ${senderUsername.code()}!`);
      } else {
        sentMessage.edit(
          `<@${this.author.id}>, Updated user ${senderUsername.code()}!`
        );
      }
    });
  }
}
