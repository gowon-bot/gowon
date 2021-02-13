import { BaseCommand } from "../../lib/command/BaseCommand";
import { Arguments } from "../../lib/arguments/arguments";
import { IndexingService } from "../../services/indexing/IndexingService";
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

  indexingService = new IndexingService(this.logger);

  async run() {
    const embed = this.newEmbed()
      .setTitle("Gowon status:")
      .setDescription(
        "**Latency**: ```\nIndexer.....pinging\nDiscord.....pinging\n```"
      );

    const indexerLatency = await this.indexerLatency();
    const [sentMessage, discordLatency] = await this.discordLatency(embed);

    await sentMessage.edit(
      embed.setDescription(
        "**Latency**:\n```\n" +
          `Indexer.....${this.displayLatency(indexerLatency)}
Discord.....${this.displayLatency(discordLatency)}` +
          "\n```"
      )
    );
  }

  private async indexerLatency(): Promise<Stopwatch> {
    const stopwatch = new Stopwatch();
    stopwatch.start();

    try {
      await this.indexingService.ping();
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
