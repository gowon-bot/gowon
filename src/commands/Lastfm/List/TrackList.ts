import {
  displayNumber,
  displayNumberedList,
} from "../../../lib/views/displays";
import { ListCommand } from "./ListCommand";

export default class TrackList extends ListCommand {
  idSeed = "stayc yoon";

  description = "Shows your top tracks over a given time period";
  aliases = ["tlist", "toptracks", "toptrack", "tracks", "tl", "topsongs"];

  async run() {
    const { requestable, username } = await this.parseMentions();

    const topTracks = await this.lastFMService.topTracks(this.ctx, {
      username: requestable,
      limit: this.listAmount,
      period: this.timePeriod,
    });

    const messageEmbed = this.newEmbed()
      .setTitle(
        `Top ${displayNumber(this.listAmount, "track")} for \`${username}\` ${
          this.humanReadableTimePeriod
        }`
      )
      .setDescription(
        displayNumberedList(
          topTracks.tracks.map(
            (t) =>
              `${t.name.strong()} by ${t.artist.name.italic()} - ${displayNumber(
                t.userPlaycount,
                "play"
              )}`
          )
        )
      );

    await this.send(messageEmbed);
  }
}
