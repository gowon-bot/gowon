import { italic } from "../../../helpers/discord";
import {
  displayNumber,
  displayNumberedList,
  displayTrackLink,
} from "../../../lib/views/displays";
import { ListCommand } from "./ListCommand";

export default class TrackList extends ListCommand {
  idSeed = "stayc yoon";

  slashCommandName = "toptracks";
  description = "Shows your top tracks over a given time period";
  aliases = ["tlist", "toptracks", "toptrack", "tracks", "tl", "topsongs"];

  async run() {
    const { requestable, username, perspective } = await this.getMentions();

    const topTracks = await this.lastFMService.topTracks(this.ctx, {
      username: requestable,
      limit: this.listAmount,
      period: this.timePeriod,
      ...this.timeRange?.asTimeframeParams,
    });

    const messageEmbed = this.newEmbed()
      .setAuthor(this.generateEmbedAuthor("Top tracks"))
      .setTitle(
        `Top tracks for \`${username}\` ${
          this.timeRange?.humanized || this.humanizedPeriod
        }`
      )
      .setDescription(
        displayNumberedList(
          topTracks.tracks.map(
            (t) =>
              `${displayTrackLink(t.artist.name, t.name, true)} by ${
                t.artist.name
              } - ${displayNumber(t.userPlaycount, "play")}`
          )
        ) ||
          italic(
            `${perspective.upper.plusToHave} no scrobbled tracks over that time period`
          )
      );

    await this.send(messageEmbed);
  }
}
