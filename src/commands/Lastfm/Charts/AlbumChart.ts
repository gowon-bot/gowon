import { AttachmentBuilder } from "discord.js";
import { BetaAccess } from "../../../lib/command/access/access";
import { NumberArgument } from "../../../lib/context/arguments/argumentTypes/NumberArgument";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { ArgumentsMap } from "../../../lib/context/arguments/types";
import { ServiceRegistry } from "../../../services/ServicesRegistry";
import { ChartService } from "../../../services/pantomime/ChartService";
import { LastFMBaseCommand } from "../LastFMBaseCommand";

const args = {
  ...standardMentions,
  size: new NumberArgument(),
} satisfies ArgumentsMap;

export default class AlbumChart extends LastFMBaseCommand<typeof args> {
  idSeed = "dreamnote habin";

  arguments = args;

  description = "Creates a chart of your weekly album (experimental)";
  aliases = ["ch", "chart"];

  access = new BetaAccess();

  chartService = ServiceRegistry.get(ChartService);

  async run() {
    const { requestable, senderUser } = await this.getMentions();

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

    await this.payload.channel.send({
      files: [new AttachmentBuilder(await image, { name: "file.png" })],
    });
  }
}
