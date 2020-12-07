import { numberDisplay } from "../../../helpers";
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
        `Top ${numberDisplay(this.listAmount, "artist")} for \`${username}\` ${
          this.humanReadableTimePeriod
        }`
      )
      .setDescription(
        topArtists.artist
          .map(
            (a, idx) =>
              `${idx + 1}. ${a.name.strong()} - ${numberDisplay(
                a.playcount,
                "play"
              )}`
          )
          .join("\n")
      );

    await this.send(messageEmbed);
  }
}
