import { IndexingWebhookService } from "../../api/indexing/IndexingWebhookService";
import { BaseCommand } from "../../lib/command/BaseCommand";

const args = {
  inputs: {
    token: { index: 0 },
  },
  mentions: {},
};

export default class Test extends BaseCommand<typeof args> {
  idSeed = "clc seunghee";

  description = "Testing testing 123";
  secretCommand = true;

  arguments = args;

  indexingWebhookService = IndexingWebhookService.getInstance();

  async run() {
    await this.send("Waiting for webhook before executing");

    await this.indexingWebhookService.waitForResponse(
      this.parsedArguments.token!,
      30000 // timeout
    );

    await this.send("Hello, world!");
  }
}
