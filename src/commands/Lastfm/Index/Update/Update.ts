import { IndexerError } from "../../../../errors";
import { Stopwatch } from "../../../../helpers";
import { IndexingCommand } from "../../../../lib/indexing/IndexingCommand";
import { IndexingService } from "../../../../services/indexing/IndexingService";
import {
  UpdateUserConnector,
  UpdateUserParams,
  UpdateUserResponse,
} from "./Update.connector";

const args = {
  inputs: {},
  mentions: {},
} as const;

export default class Update extends IndexingCommand<
  UpdateUserResponse,
  UpdateUserParams,
  typeof args
> {
  connector = new UpdateUserConnector();

  idSeed = "bvndit yiyeon";

  description = "Testing testing 123";
  secretCommand = true;
  devCommand = true;

  arguments = args;

  indexingService = new IndexingService(this.logger);

  stopwatch = new Stopwatch();

  async run() {
    const { senderUsername } = await this.parseMentions();

    const sentMessage = await this.reply(
      `Updating user ${senderUsername.code()}`
    );

    this.stopwatch.start();
    const response = await this.query({ username: senderUsername });

    const errors = this.parseErrors(response);

    if (errors) throw new IndexerError("An unknown error ocurred");

    this.indexingService.webhook.onResponse(response.updateUser.token, () => {
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
