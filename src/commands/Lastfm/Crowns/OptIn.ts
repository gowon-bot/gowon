import { CrownsChildCommand } from "./CrownsChildCommand";
import { Message } from "discord.js";

export class OptIn extends CrownsChildCommand {
  description = "Opts you back into the crowns game";
  usage = ""

  async run(message: Message) {
    let sentMessage = await message.reply(
      "are you sure you want to opt back into the crowns game?"
    );

    await sentMessage.react("✅");

    try {
      await sentMessage.awaitReactions(
        (reaction, user) =>
          user.id == message.author.id && reaction.emoji.name == "✅",
        { max: 1, time: 30000 }
      );

      await this.crownsService.optIn(message.guild?.id!, message.author.id);

      await message.reply(`Opted you back in`);
    } catch {
      await message.reply(`No reaction, cancelling opt in`);
    }
  }
}
