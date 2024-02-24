import { italic } from "../../../helpers/discord";
import {
  displayNumber,
  displayNumberedList,
  displayTrackLink,
} from "../../../lib/ui/displays";
import { ListCommand } from "./ListCommand";

export default class TrackList extends ListCommand {
  idSeed = "stayc yoon";

  slashCommandName = "toptracks";
  description = "Shows your top tracks over a given time period";
  aliases = ["tlist", "toptracks", "toptrack", "tracks", "tl", "topsongs"];

  async run() {
    const { requestable, perspective } = await this.getMentions();

    const topTracks = await this.lastFMService.topTracks(this.ctx, {
      username: requestable,
      limit: this.listAmount,
      period: this.timePeriod,
      ...this.dateRange?.asTimeframeParams,
    });

    const messageEmbed = this.minimalEmbed()
      .setTitle(
        `${perspective.upper.possessive} top tracks ${
          this.dateRange?.humanized() || this.humanizedPeriod
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

    await this.reply(messageEmbed);
  }
}
