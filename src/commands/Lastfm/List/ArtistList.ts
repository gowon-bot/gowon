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
    const { requestable, username } = await this.parseMentions();

    const topArtists = await this.lastFMService.topArtists(this.ctx, {
      username: requestable,
      limit: this.listAmount,
      period: this.timePeriod,
    });

    const messageEmbed = this.newEmbed()
      .setAuthor(...this.generateEmbedAuthor("Top artists"))
      .setTitle(`Top artists for \`${username}\` ${this.humanizedPeriod}`)
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
