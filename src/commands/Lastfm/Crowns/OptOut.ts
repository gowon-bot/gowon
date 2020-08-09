import { CrownsChildCommand } from "./CrownsChildCommand";
import { Message, MessageEmbed } from "discord.js";
import { numberDisplay } from "../../../helpers";

export class OptOut extends CrownsChildCommand {
  description = "Opts you out of the crowns game";
  usage = "";

  async run(message: Message) {
    let sentMessage = await message.reply(
      `are you sure you want to opt out? This will delete all your crowns!`
    );

    message.channel.stopTyping();
    await sentMessage.react("✅");

    try {
      await sentMessage.awaitReactions(
        (reaction, user) =>
          user.id == message.author.id && reaction.emoji.name == "✅",
        { max: 1, time: 30000, errors: ["time"] }
      );

      let numberOfCrowns = await this.crownsService.optOut(
        message.guild?.id!,
        message.author.id
      );

      await message.channel.send(
        new MessageEmbed().setDescription(
          `Opted you out, deleting ${numberDisplay(
            numberOfCrowns,
            "crowns"
          ).bold()}`
        )
      );
    } catch {
      await message.reply(`No reaction, cancelling opt out`);
    }
  }
}
