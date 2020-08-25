import { CrownsChildCommand } from "./CrownsChildCommand";
import { Arguments } from "../../../lib/arguments/arguments";
import { Message, MessageEmbed } from "discord.js";
import { LogicError } from "../../../errors";

export class Kill extends CrownsChildCommand {
  description = "Kills a crown";
  usage = ["artist (be specific with case!)"];

  arguments: Arguments = {
    inputs: {
      artist: { index: { start: 0 } },
    },
  };

  async run(message: Message) {
    let artist = this.parsedArguments.artist as string;

    let crown = await this.crownsService.getCrown(artist, message.guild?.id!);

    if (!crown)
      throw new LogicError(`A crown for ${artist.bold()} doesn't exist`);

    let sentMessage = await this.reply(
      `are you sure you want to kill the crown for ${crown?.artistName.bold()}?`
    );

    message.channel.stopTyping();
    await sentMessage.react("✅");

    try {
      await sentMessage.awaitReactions(
        (reaction, user) =>
          user.id == message.author.id && reaction.emoji.name == "✅",
        { max: 1, time: 30000, errors: ["time"] }
      );

      await this.crownsService.killCrown(artist, message.guild?.id!);

      await this.send(
        new MessageEmbed()
          .setAuthor(
            message.member?.nickname || message.author.username,
            message.author.avatarURL() || undefined
          )
          .setDescription(`Successfully killed the crown for ${artist.bold()}`)
      );
    } catch {
      await this.reply(
        `No reaction, cancelling crown kill for ${artist.bold()}`
      );
    }
  }
}
