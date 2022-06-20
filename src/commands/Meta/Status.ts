import { Command } from "../../lib/command/Command";
import { Stopwatch } from "../../helpers";
import { Message, MessageEmbed } from "discord.js";
import { LogicError } from "../../errors/errors";
import { ServiceRegistry } from "../../services/ServicesRegistry";
import { LilacAPIService } from "../../services/lilac/LilacAPIService";

export default class Status extends Command {
  idSeed = "Fill in a unique idSeed here";

  description = "See the status of Gowon's services";
  category = "meta";
  usage = "";

  lilacAPIService = ServiceRegistry.get(LilacAPIService);

  async run() {
    const embed = this.newEmbed()
      .setTitle("Gowon status:")
      .setDescription(
        "**Latency**: ```\nMirrorball.....pinging\nDiscord.....pinging\nLilac.....pinging\n```"
      );

    const mirrorballLatency = await this.mirrorballLatency();
    const lilacLatency = await this.lilacLatency();
    const [sentMessage, discordLatency] = await this.discordLatency(embed);

    await sentMessage.edit({
      embeds: [
        embed.setDescription(
          "**Latency**:\n```\n" +
            `Mirrorball.....${this.displayLatency(mirrorballLatency)}
Discord........${this.displayLatency(discordLatency)}
Lilac..........${this.displayLatency(lilacLatency)}` +
            "\n```"
        ),
      ],
    });
  }

  private async mirrorballLatency(): Promise<Stopwatch> {
    const stopwatch = new Stopwatch();
    stopwatch.start();

    try {
      await this.mirrorballService.ping(this.ctx);
    } catch {
      return stopwatch.zero();
    }

    stopwatch.stop();

    return stopwatch;
  }

  private async lilacLatency(): Promise<Stopwatch> {
    const stopwatch = new Stopwatch();
    stopwatch.start();

    try {
      await this.lilacAPIService.ping(this.ctx);
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
