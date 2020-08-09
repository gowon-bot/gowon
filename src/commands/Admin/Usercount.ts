import { Message, MessageEmbed } from "discord.js";
import { AdminBaseCommand } from "./AdminBaseCommand";
import { numberDisplay } from "../../helpers";

export default class Usercount extends AdminBaseCommand {
  description = "Count the number of users";
  aliases = ["uc"];
  usage = "";

  async run(message: Message) {
    let usercount = await this.usersService.countUsers(message.guild?.id!);

    await message.channel.send(
      new MessageEmbed()
        .setAuthor(message.guild?.name!, message.guild?.iconURL() as string)
        .setDescription(
          `There are ${numberDisplay(usercount, "registered user").bold()} in ${
            message.guild?.name
          }`
        )
    );
  }
}
