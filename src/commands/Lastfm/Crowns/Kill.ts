import { CrownsChildCommand } from "./CrownsChildCommand";
import { Arguments } from "../../../lib/arguments/arguments";
import { Message, MessageEmbed } from "discord.js";

export class Kill extends CrownsChildCommand {
  description = "Shows information about a crown";

  arguments: Arguments = {
    inputs: {
      artist: { index: { start: 0 } },
    },
  };

  async run(message: Message) {
    let artist = this.parsedArguments.artist as string;

    let crown = await this.crownsService.getCrown(artist, message.guild?.id!);

    let sentMessage = await message.reply(
      `are you sure you want to kill the crown for ${crown?.artistName.bold()}?`
    );

    await sentMessage.react("✅");

    try {
      await sentMessage.awaitReactions(
        (reaction, user) =>
          user.id == message.author.id && reaction.emoji.name == "✅",
        { max: 1, time: 30000 }
      );

      await this.crownsService.killCrown(artist, message.guild?.id!);

      await message.channel.send(
        new MessageEmbed().setAuthor(
          message.member?.nickname,
          message.author.avatarURL() || undefined
        ).setDescription(`Successfully killed the crown for ${artist.bold()}`)
      );
    } catch {
      await message.reply(`No reaction, cancelling crown kill for ${artist.bold()}`);
    }
  }
}
