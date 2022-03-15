import { BaseCommand } from "../../lib/command/BaseCommand";

export default class AirFry extends BaseCommand {
  idSeed = "ive rei";

  subcategory = "fun";
  description = "Ping! Pong! Pang?";
  secretCommand = true;

  async run() {
    await this.reply(
      "cdn.discordapp.com/attachments/768596255697272865/953103223751839844/1503414000255655944_01.mp4"
    );
  }
}
