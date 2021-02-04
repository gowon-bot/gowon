import { CrownsChildCommand } from "./CrownsChildCommand";
import { Arguments } from "../../../lib/arguments/arguments";
import { Message } from "discord.js";
import { LogicError } from "../../../errors";
import { Validation } from "../../../lib/validation/ValidationChecker";
import { validators } from "../../../lib/validation/validators";

const args = {
  inputs: {
    artist: { index: { start: 0 } },
  },
} as const;

export class Kill extends CrownsChildCommand<typeof args> {
  idSeed = "wjsn xuanyi";

  description = "Kills a crown";
  usage = ["artist (case sensitive!)"];

  arguments: Arguments = args;

  validation: Validation = {
    artist: new validators.Required({}),
  };

  async run(message: Message) {
    let artist = this.parsedArguments.artist!;

    let crown = await this.crownsService.getCrown(artist, message.guild?.id!, {
      noRedirect: true,
      caseSensitive: true,
    });

    if (!crown)
      throw new LogicError(`A crown for ${artist.strong()} doesn't exist! *Make sure the artist exactly matches the artist name on the crown!*`);

    let sentMessage = await this.reply(
      `are you sure you want to kill the crown for ${crown?.artistName.strong()}?`
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
      this.crownsService.scribe.kill(crown, message.author);

      await this.send(
        this.newEmbed()
          .setAuthor(
            message.member?.nickname || message.author.username,
            message.author.avatarURL() || undefined
          )
          .setDescription(
            `Successfully killed the crown for ${artist.strong()}`
          )
      );
    } catch {
      await this.reply(
        `No reaction, cancelling crown kill for ${artist.strong()}`
      );
    }
  }
}
