import { italic } from "../../../helpers/discord";
import {
  displayAlbumLink,
  displayNumber,
  displayNumberedList,
} from "../../../lib/ui/displays";
import { ListCommand } from "./ListCommand";

export default class AlbumList extends ListCommand {
  idSeed = "stayc sumin";

  slashCommandName = "topalbums";
  description = "Shows your top albums over a given time period";
  aliases = ["llist", "allist", "topalbums", "topalbum", "albums", "ll"];

  async run() {
    const { requestable, perspective } = await this.getMentions();

    const topAlbums = await this.lastFMService.topAlbums(this.ctx, {
      username: requestable,
      limit: this.listAmount,
      period: this.timePeriod,
      ...this.dateRange?.asTimeframeParams,
    });

    const messageEmbed = this.minimalEmbed()
      .setTitle(
        `${perspective.upper.possessive} top albums ${
          this.dateRange?.humanized() || this.humanizedPeriod
        }`
      )
      .setDescription(
        displayNumberedList(
          topAlbums.albums.map(
            (a) =>
              `${displayAlbumLink(a.artist.name, a.name, true)} by ${
                a.artist.name
              } - ${displayNumber(a.userPlaycount, "play")}`
          )
        ) ||
          italic(
            `${perspective.upper.plusToHave} no scrobbled albums over that time period`
          )
      );

    await this.reply(messageEmbed);
  }
}
