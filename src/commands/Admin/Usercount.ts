import { bold } from "../../helpers/discord";
import { displayNumber } from "../../lib/ui/displays";
import { InfoEmbed } from "../../lib/ui/embeds/InfoEmbed";
import { AdminBaseCommand } from "./AdminBaseCommand";

export default class Usercount extends AdminBaseCommand {
  idSeed = "loona yeojin";

  description = "Displays the number of users logged into the bot";
  aliases = ["uc"];
  usage = "";
  devCommand = true;

  async run() {
    const usercount = await this.usersService.countUsers(this.ctx);

    const embed = new InfoEmbed().setDescription(
      `There are ${bold(
        displayNumber(usercount, "registered user")
      )} logged into Gowon`
    );

    await this.reply(embed);
  }
}
