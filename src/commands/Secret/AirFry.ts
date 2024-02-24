import { Command } from "../../lib/command/Command";

export default class AirFry extends Command {
  idSeed = "ive rei";

  subcategory = "fun";
  description = "soyeon air fryer";
  secretCommand = true;

  async run() {
    await this.reply(
      "cdn.discordapp.com/attachments/768596255697272865/953103223751839844/1503414000255655944_01.mp4"
    );
  }
}
