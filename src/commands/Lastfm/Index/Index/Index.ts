import { IndexerError } from "../../../../errors";
import { Arguments } from "../../../../lib/arguments/arguments";
import { IndexingCommand } from "../../../../lib/indexing/IndexingCommand";
import { Perspective } from "../../../../lib/Perspective";
import { Validation } from "../../../../lib/validation/ValidationChecker";
import { validators } from "../../../../lib/validation/validators";
import { IndexingService } from "../../../../services/indexing/IndexingService";
import {
  IndexUserParams,
  IndexUserResponse,
  IndexUserConnector,
} from "./Index.connector";

const args = {
  inputs: {
    username: { index: 0 },
  },
} as const;

export default class Index extends IndexingCommand<
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
  devCommand = true;

  indexingService = new IndexingService();

  arguments: Arguments = args;

  validation: Validation = {
    username: new validators.Required({}),
  };

  async run() {
    const { senderUsername } = await this.parseMentions();

    const indexingUsername =
      (this.gowonClient.isDeveloper(this.author.id) &&
        this.parsedArguments.username) ||
      senderUsername;

    const perspective = this.usersService.perspective(
      senderUsername,
      indexingUsername
    );

    this.send(`Indexing user ${indexingUsername.code()}`);

    let response = await this.query({ username: indexingUsername });

    const errors = this.parseErrors(response);

    if (errors) {
      throw new IndexerError("An unknown error occurred");
    }

    this.indexingService.webhook.onResponse(response.indexUser.token, () =>
      this.notify(perspective)
    );
  }

  private notify(perspective: Perspective) {
    this.message.reply(
      `Successfully updated ${perspective.possessive} information!`
    );
  }
}
