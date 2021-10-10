import { BaseCommand } from "../lib/command/BaseCommand";
import config from "../../config.json";
import { Emoji } from "../lib/Emoji";

export default class Invite extends BaseCommand {
  idSeed = "iz*one sakura";

  subcategory = "about";
  description = "Invite the bot to your server!";

  async run() {
    await this.send(
      `${Emoji.gowonswag2} You can invite Gowon to your server with the following link: <https://discord.com/oauth2/authorize?client_id=${config.discordClientID}&scope=bot&permissions=377957435456>`
    );
  }
}
