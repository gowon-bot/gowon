import { numberDisplay } from "../../../helpers";
import { ListCommand } from "./ListCommand";

export default class AlbumList extends ListCommand {
  description = "Shows your top albums over a given time period";
  aliases = ["llist", "allist", "topalbums", "topalbum", "albums", "ll"];

  async run() {
    let { username } = await this.parseMentions();

    let topAlbums = await this.lastFMService.topAlbums({
      username,
      limit: this.listAmount,
      period: this.timePeriod,
    });

    let messageEmbed = this.newEmbed()
      .setTitle(
        `Top ${numberDisplay(this.listAmount, "album")} for \`${username}\` ${
          this.humanReadableTimePeriod
        }`
      )
      .setDescription(
        topAlbums.album
          .map(
            (a) =>
              `${numberDisplay(
                a.playcount,
                "play"
              )} - ${a.name.bold()} by ${a.artist.name.italic()}`
          )
          .join("\n")
      );

    await this.send(messageEmbed);
  }
}
