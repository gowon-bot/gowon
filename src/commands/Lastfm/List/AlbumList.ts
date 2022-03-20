import { bold, italic } from "../../../helpers/discord";
import {
  displayNumber,
  displayNumberedList,
} from "../../../lib/views/displays";
import { ListCommand } from "./ListCommand";

export default class AlbumList extends ListCommand {
  idSeed = "stayc sumin";

  slashCommandName = "topalbums";
  description = "Shows your top albums over a given time period";
  aliases = ["llist", "allist", "topalbums", "topalbum", "albums", "ll"];

  async run() {
    const { requestable, username, perspective } = await this.getMentions();

    const topAlbums = await this.lastFMService.topAlbums(this.ctx, {
      username: requestable,
      limit: this.listAmount,
      period: this.timePeriod,
      ...this.timeRange?.asTimeframeParams,
    });

    const messageEmbed = this.newEmbed()
      .setAuthor(this.generateEmbedAuthor("Top albums"))
      .setTitle(
        `Top albums for \`${username}\` ${
          this.timeRange?.humanized || this.humanizedPeriod
        }`
      )
      .setDescription(
        displayNumberedList(
          topAlbums.albums.map(
            (a) =>
              `${bold(a.name)} by ${italic(a.artist.name)} - ${displayNumber(
                a.userPlaycount,
                "play"
              )}`
          )
        ) ||
          italic(
            `${perspective.upper.plusToHave} no scrobbled albums over that time period`
          )
      );

    await this.send(messageEmbed);
  }
}
