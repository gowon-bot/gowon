import {
  displayNumber,
  displayNumberedList,
} from "../../../lib/views/displays";
import { ListCommand } from "./ListCommand";

export default class ArtistList extends ListCommand {
  idSeed = "stayc seeun";

  description = "Shows your top artists over a given time period";
  aliases = ["alist", "topartists", "topartist", "artists", "al"];

  async run() {
    let { username } = await this.parseMentions();

    let topArtists = await this.lastFMService.topArtists({
      username,
      limit: this.listAmount,
      period: this.timePeriod,
    });

    let messageEmbed = this.newEmbed()
      .setTitle(
        `Top ${displayNumber(this.listAmount, "artist")} for \`${username}\` ${
          this.humanReadableTimePeriod
        }`
      )
      .setDescription(
        displayNumberedList(
          topArtists.artists.map(
            (a) =>
              `${a.name.strong()} - ${displayNumber(a.userPlaycount, "play")}`
          )
        )
      );

    await this.send(messageEmbed);
  }
}
