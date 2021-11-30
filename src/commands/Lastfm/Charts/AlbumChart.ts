import { MessageAttachment } from "discord.js";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";
import { BetaAccess } from "../../../lib/command/access/access";
import { ChartService } from "../../../services/pantomime/ChartService";
import { ServiceRegistry } from "../../../services/ServicesRegistry";
import { LastFMBaseCommand } from "../LastFMBaseCommand";

const args = {
  inputs: {
    size: { index: 0, number: true },
  },
  mentions: standardMentions,
} as const;

export default class AlbumChart extends LastFMBaseCommand<typeof args> {
  idSeed = "dreamnote habin";

  arguments = args;

  description = "Creates a chart of your weekly album (experimental)";
  aliases = ["ch", "chart"];

  access = new BetaAccess();

  chartService = ServiceRegistry.get(ChartService);

  async run() {
    const { requestable, senderUser } = await this.parseMentions();

    this.access.checkAndThrow(senderUser);

    const albums = await this.lastFMService.topAlbums(this.ctx, {
      period: "7day",
      username: requestable,
      limit: this.parsedArguments.size || 9,
    });

    const albumURLs = albums.albums
      .map((a) => ({
        url: a.images.get("extralarge"),
      }))
      .filter((i) => !!i.url) as { url: string }[];

    const image = this.chartService.createChart(this.ctx, albumURLs, {
      width: 1000,
      height: 1000,
    });

    await this.message.channel.send({
      files: [new MessageAttachment(await image, "file.png")],
    });
  }
}
