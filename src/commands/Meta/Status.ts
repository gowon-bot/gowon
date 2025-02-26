import { Stopwatch } from "../../helpers";
import { bold, italic, subsubheader } from "../../helpers/discord";
import { extraWideSpace } from "../../helpers/specialCharacters";
import { LineConsolidator } from "../../lib/LineConsolidator";
import { Command } from "../../lib/command/Command";
import { Emoji } from "../../lib/emoji/Emoji";
import { EmbedView } from "../../lib/ui/views/EmbedView";
import { LastFMService } from "../../services/LastFM/LastFMService";
import { ServiceRegistry } from "../../services/ServicesRegistry";
import { LilacAPIService } from "../../services/lilac/LilacAPIService";

type Latencies = {
  discord?: Stopwatch;
  lastfm?: Stopwatch;
  mirrorball?: Stopwatch;
  lilac?: Stopwatch;
};

export default class Status extends Command {
  idSeed = "newjeans danielle";

  description = "See the status of Gowon's services";
  category = "meta";
  usage = "";

  lilacAPIService = ServiceRegistry.get(LilacAPIService);
  lastFMService = ServiceRegistry.get(LastFMService);

  async run() {
    const embed = this.minimalEmbed()
      .setTitle("Gowon status:")
      .setDescription(this.displayLatencies({} as Latencies));

    const mirrorballLatency = await this.mirrorballLatency();
    const lilacLatency = await this.lilacLatency();
    const discordLatency = await this.discordLatency(embed);
    const lastfmLatency = await this.lastFMLatency();

    await embed
      .setDescription(
        this.displayLatencies({
          discord: discordLatency,
          lastfm: lastfmLatency,
          mirrorball: mirrorballLatency,
          lilac: lilacLatency,
        })
      )
      .editMessage(this.ctx);
  }

  private displayLatencies(latencies: Latencies): LineConsolidator {
    const displayLatency = (latency: Stopwatch | undefined) =>
      italic(latency ? this.displayLatency(latency) : "pinging");

    return new LineConsolidator().addLines(
      subsubheader("Latency:"),

      bold("External:"),
      `${extraWideSpace}${Emoji.discordLogo} Discord – ${displayLatency(
        latencies.discord
      )}`,
      `${extraWideSpace}${Emoji.lastfmLogo} Last.fm – ${displayLatency(
        latencies.lastfm
      )}`,
      "",
      bold("Gowon:"),
      `${extraWideSpace}${Emoji.mirrorballLogo} Mirrorball – ${displayLatency(
        latencies.mirrorball
      )}`,
      `${extraWideSpace}${Emoji.lilacLogo} Lilac – ${displayLatency(
        latencies.lilac
      )}`
    );
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

  private async discordLatency(embed: EmbedView): Promise<Stopwatch> {
    const stopwatch = new Stopwatch();
    stopwatch.start();

    try {
      await this.reply(embed);
    } catch {
      throw new Error("Failed to send message...");
    }

    stopwatch.stop();

    return stopwatch;
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
