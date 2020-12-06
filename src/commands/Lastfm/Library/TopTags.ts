import { numberDisplay } from "../../../helpers";
import { Arguments } from "../../../lib/arguments/arguments";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";
import { TagConsolidator } from "../../../lib/tags/TagConsolidator";
import { TagsService } from "../../../services/dbservices/TagsService";
import { LastFMBaseCommand } from "../LastFMBaseCommand";

export default class TopTags extends LastFMBaseCommand {
  description = "Displays your top tags";
  secretCommand = true;
  aliases = [];

  arguments: Arguments = {
    mentions: standardMentions,
  };

  tagsService = new TagsService(this.logger);

  showLoadingAfter = this.gowonService.constants.defaultLoadingTime;

  async run() {
    let { username } = await this.parseMentions();

    let topArtists = await this.lastFMService.topArtists({
      username,
      limit: 1000,
    });

    let tagsCount: { [artist: string]: number } = {};

    for (let artist of topArtists.artist) {
      let artistTags = await this.tagsService.getTags(artist.name);

      if (!artistTags) {
        artistTags = await this.lastFMService.getArtistTags(artist.name);
      }

      let tagConsolidator = new TagConsolidator().addTags(
        artistTags.map((t) => t.toLowerCase())
      );

      for (let tag of tagConsolidator.consolidate(Infinity, false)) {
        if (!tagsCount[tag]) tagsCount[tag] = 0;
        tagsCount[tag]++;
      }
    }

    let topTags = Object.keys(tagsCount).sort(
      (a, b) => tagsCount[b] - tagsCount[a]
    );

    let topTopTags = topTags.slice(0, 10);

    let embed = this.newEmbed()
      .setTitle(`Top tags for ${username}`)
      .setDescription(
        `_${numberDisplay(topTags.length, "unique tag")}_\n` +
          topTopTags
            .map(
              (tt, idx) =>
                `${idx + 1}. ${tt} (${numberDisplay(tagsCount[tt], "artist")})`
            )
            .join("\n")
      );

    await this.send(embed);
  }
}
