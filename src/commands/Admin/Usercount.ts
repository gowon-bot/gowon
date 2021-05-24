import { Message } from "discord.js";
import { displayNumber } from "../../lib/views/displays";
import { AdminBaseCommand } from "./AdminBaseCommand";

export default class Usercount extends AdminBaseCommand {
  idSeed = "loona yeojin";

  description = "Displays the number of users logged into the bot";
  aliases = ["uc"];
  usage = "";
  devCommand = true;

  async run(message: Message) {
    let usercount = await this.usersService.countUsers();

    await this.send(
      this.newEmbed()
        .setAuthor(message.guild?.name!, message.guild?.iconURL() as string)
        .setDescription(
          `There are ${displayNumber(
            usercount,
            "registered user"
          ).strong()} logged into Gowon`
        )
    );
  }
}
