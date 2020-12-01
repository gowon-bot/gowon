import { Message } from "discord.js";
import { AdminBaseCommand } from "./AdminBaseCommand";
import { numberDisplay } from "../../helpers";

export default class Usercount extends AdminBaseCommand {
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
          `There are ${numberDisplay(
            usercount,
            "registered user"
          ).strong()} logged into Gowon`
        )
    );
  }
}
