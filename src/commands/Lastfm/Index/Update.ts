import { BaseCommand } from "../../../lib/command/BaseCommand";
import { IndexingService } from "../../../services/indexing/IndexingService";

export default class Update extends BaseCommand {
  idSeed = "bvndit yiyeon";

  description = "Testing testing 123";
  secretCommand = true;
  devCommand = true;

  indexingService = new IndexingService(this.logger);

  async run() {
    const { senderUsername } = await this.parseMentions();

    await this.indexingService.update(senderUsername);

    await this.reply(`Updating user ${senderUsername.code()}`);
  }
}
