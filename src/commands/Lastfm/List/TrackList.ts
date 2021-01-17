import { numberDisplay } from "../../../helpers";
import { ListCommand } from "./ListCommand";

export default class TrackList extends ListCommand {
  idSeed = "stayc yoon";

  description = "Shows your top tracks over a given time period";
  aliases = ["tlist", "toptracks", "toptrack", "tracks", "tl", "topsongs"];

  async run() {
    let { username } = await this.parseMentions();

    let topTracks = await this.lastFMService.topTracks({
      username,
      limit: this.listAmount,
      period: this.timePeriod,
    });

    let messageEmbed = this.newEmbed()
      .setTitle(
        `Top ${numberDisplay(this.listAmount, "track")} for \`${username}\` ${
          this.humanReadableTimePeriod
        }`
      )
      .setDescription(
        topTracks.track
          .map(
            (t, idx) =>
              `${
                idx + 1
              }. ${t.name.strong()} by ${t.artist.name.italic()} - ${numberDisplay(
                t.playcount,
                "play"
              )}`
          )
          .join("\n")
      );

    await this.send(messageEmbed);
  }
}
