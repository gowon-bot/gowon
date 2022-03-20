import { bold, italic } from "../../../helpers/discord";
import {
  displayNumber,
  displayNumberedList,
} from "../../../lib/views/displays";
import { ListCommand } from "./ListCommand";

export default class ArtistList extends ListCommand {
  idSeed = "stayc seeun";

  slashCommandName = "topartists";
  description = "Shows your top artists over a given time period";
  aliases = ["alist", "topartists", "topartist", "artists", "al"];

  async run() {
    const { requestable, username, perspective } = await this.getMentions();

    const topArtists = await this.lastFMService.topArtists(this.ctx, {
      username: requestable,
      limit: this.listAmount,
      period: this.timePeriod,
      ...this.timeRange?.asTimeframeParams,
    });

    const messageEmbed = this.newEmbed()
      .setAuthor(this.generateEmbedAuthor("Top artists"))
      .setTitle(
        `Top artists for \`${username}\` ${
          this.timeRange?.humanized || this.humanizedPeriod
        }`
      )
      .setDescription(
        displayNumberedList(
          topArtists.artists.map(
            (a) => `${bold(a.name)} - ${displayNumber(a.userPlaycount, "play")}`
          )
        ) ||
          italic(
            `${perspective.upper.plusToHave} no scrobbled artists over that time period`
          )
      );

    await this.send(messageEmbed);
  }
}
