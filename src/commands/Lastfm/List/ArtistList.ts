import { italic } from "../../../helpers/discord";
import {
  displayArtistLink,
  displayNumber,
  displayNumberedList,
} from "../../../lib/ui/displays";
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
      ...this.dateRange?.asTimeframeParams,
    });

    const messageEmbed = this.authorEmbed()
      .setHeader("Top artists")
      .setTitle(
        `Top artists for \`${username}\` ${
          this.dateRange?.humanized() || this.humanizedPeriod
        }`
      )
      .setDescription(
        displayNumberedList(
          topArtists.artists.map(
            (a) =>
              `${displayArtistLink(a.name, true)} - ${displayNumber(
                a.userPlaycount,
                "play"
              )}`
          )
        ) ||
          italic(
            `${perspective.upper.plusToHave} no scrobbled artists over that time period`
          )
      );

    await this.send(messageEmbed);
  }
}
