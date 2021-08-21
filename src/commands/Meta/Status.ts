import { BaseCommand } from "../../lib/command/BaseCommand";
import { Arguments } from "../../lib/arguments/arguments";
import { Stopwatch } from "../../helpers";
import { Message, MessageEmbed } from "discord.js";
import { LogicError } from "../../errors";

const args = {
  inputs: {},
  mentions: {},
} as const;

export default class Status extends BaseCommand<typeof args> {
  idSeed = "Fill in a unique idSeed here";

  description = "See the status of Gowon's services";
  category = "meta";
  usage = "";

  arguments: Arguments = args;

  async run() {
    const embed = this.newEmbed()
      .setTitle("Gowon status:")
      .setDescription(
        "**Latency**: ```\nMirrorball.....pinging\nDiscord.....pinging\n```"
      );

    const mirrorballLatency = await this.mirrorballLatency();
    const [sentMessage, discordLatency] = await this.discordLatency(embed);

    await sentMessage.edit({
      embeds: [
        embed.setDescription(
          "**Latency**:\n```\n" +
            `Mirrorball.....${this.displayLatency(mirrorballLatency)}
Discord........${this.displayLatency(discordLatency)}` +
            "\n```"
        ),
      ],
    });
  }

  private async mirrorballLatency(): Promise<Stopwatch> {
    const stopwatch = new Stopwatch();
    stopwatch.start();

    try {
      await this.mirrorballService.ping();
    } catch {
      return stopwatch.zero();
    }

    stopwatch.stop();

    return stopwatch;
  }

  private async discordLatency(
    embed: MessageEmbed
  ): Promise<[Message, Stopwatch]> {
    const stopwatch = new Stopwatch();
    stopwatch.start();

    let sentMessage: Message;

    try {
      sentMessage = await this.send(embed);
    } catch {
      throw new LogicError("Failed to send message...");
    }

    stopwatch.stop();

    return [sentMessage, stopwatch];
  }

  private displayLatency(latency: Stopwatch): string {
    const elapsed = latency.elapsedInMilliseconds;

    if (elapsed === 0) return "ERROR";
    else return `${elapsed.toFixed(2)}ms`;
  }
}
