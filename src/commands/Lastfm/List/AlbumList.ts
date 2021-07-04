import {
  displayNumber,
  displayNumberedList,
} from "../../../lib/views/displays";
import { ListCommand } from "./ListCommand";

export default class AlbumList extends ListCommand {
  idSeed = "stayc sumin";

  description = "Shows your top albums over a given time period";
  aliases = ["llist", "allist", "topalbums", "topalbum", "albums", "ll"];

  async run() {
    const { requestable, username } = await this.parseMentions();

    const topAlbums = await this.lastFMService.topAlbums({
      username: requestable,
      limit: this.listAmount,
      period: this.timePeriod,
    });

    const messageEmbed = this.newEmbed()
      .setTitle(
        `Top ${displayNumber(this.listAmount, "album")} for \`${username}\` ${
          this.humanReadableTimePeriod
        }`
      )
      .setDescription(
        displayNumberedList(
          topAlbums.albums.map(
            (a) =>
              `${a.name.strong()} by ${a.artist.name.italic()} - ${displayNumber(
                a.userPlaycount,
                "play"
              )}`
          )
        )
      );

    await this.send(messageEmbed);
  }
}
