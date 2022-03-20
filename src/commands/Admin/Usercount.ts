import { bold } from "../../helpers/discord";
import { displayNumber } from "../../lib/views/displays";
import { AdminBaseCommand } from "./AdminBaseCommand";

export default class Usercount extends AdminBaseCommand {
  idSeed = "loona yeojin";

  description = "Displays the number of users logged into the bot";
  aliases = ["uc"];
  usage = "";
  devCommand = true;

  async run() {
    let usercount = await this.usersService.countUsers(this.ctx);

    await this.send(
      this.newEmbed()
        .setAuthor(this.generateEmbedAuthor("User count"))
        .setDescription(
          `There are ${bold(
            displayNumber(usercount, "registered user")
          )} logged into Gowon`
        )
    );
  }
}
