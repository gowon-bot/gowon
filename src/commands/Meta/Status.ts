import { Message } from "discord.js";
import { LogicError } from "../../errors/errors";
import { Stopwatch } from "../../helpers";
import { Command } from "../../lib/command/Command";
import { EmbedComponent } from "../../lib/views/framework/EmbedComponent";
import { LastFMService } from "../../services/LastFM/LastFMService";
import { ServiceRegistry } from "../../services/ServicesRegistry";
import { LilacAPIService } from "../../services/lilac/LilacAPIService";

export default class Status extends Command {
  idSeed = "Fill in a unique idSeed here";

  description = "See the status of Gowon's services";
  category = "meta";
  usage = "";

  lilacAPIService = ServiceRegistry.get(LilacAPIService);
  lastFMService = ServiceRegistry.get(LastFMService);

  async run() {
    const embed = this.authorEmbed()
      .setTitle("Gowon status:")
      .setDescription(
        "**Latency**: External:\b```\nDiscord........pinging\nLast.fm........pinging\n```\nGowon:\n```\nMirrorball.....pinging\nLilac..........pinging\n```"
      );

    const mirrorballLatency = await this.mirrorballLatency();
    const lilacLatency = await this.lilacLatency();
    const [sentMessage, discordLatency] = await this.discordLatency(embed);
    const lastfmLatency = await this.lastFMLatency();

    await sentMessage.edit({
      embeds: [
        embed
          .setDescription(
            `**Latency**:
External:
\`\`\`
Discord........${this.displayLatency(discordLatency)}
Last.fm........${this.displayLatency(lastfmLatency)}
\`\`\`
Gowon:
\`\`\`
Mirrorball.....${this.displayLatency(mirrorballLatency)}
Lilac..........${this.displayLatency(lilacLatency)}
\`\`\`
`
          )
          .asMessageEmbed(),
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
    embed: EmbedComponent
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

  private async lastFMLatency() {
    const stopwatch = new Stopwatch();
    stopwatch.start();

    await this.lastFMService.nowPlaying(this.ctx, "gowon_");

    stopwatch.stop();
    return stopwatch;
  }

  private displayLatency(latency: Stopwatch): string {
    const elapsed = latency.elapsedInMilliseconds;

    if (elapsed === 0) return "ERROR";
    else return `${elapsed.toFixed(2)}ms`;
  }
}
