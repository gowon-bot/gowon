import { numberDisplay } from "../../../helpers";
import { ListCommand } from "./ListCommand";

export default class TrackList extends ListCommand {
  aliases = ["tlist", "toptracks", "toptrack", "tracks"];
  description = "Shows your top tracks";

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
