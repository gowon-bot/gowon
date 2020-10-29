import { LogicError } from "../../../errors";
import { numberDisplay } from "../../../helpers";
import { Paginator } from "../../../lib/Paginator";
import { SearchCommand } from "./SearchCommand";

export default class SearchTrack extends SearchCommand {
  shouldBeIndexed = true;
  description = "Searches your top albums for keywords";
  aliases = ["st", "str", "strack"];
  usage = ["keywords", "keywords @user"];

  async run() {
    let keywords = this.parsedArguments.keywords as string;

    let { username } = await this.parseMentions();

    let paginator = new Paginator(
      this.lastFMService.topTracks.bind(this.lastFMService),
      3,
      { username, limit: 1000 }
    );

    let topTracks = await paginator.getAll({ concatTo: "track" });

    let filtered = topTracks.track.filter((t) =>
      this.clean(t.name).includes(this.clean(keywords))
    );

    if (filtered.length !== 0 && filtered.length === topTracks.track.length) {
      throw new LogicError(
        "too many search results, try narrowing down your query..."
      );
    }

    let embed = this.newEmbed()
      .setTitle(
        `Search results in ${username.code()}'s top ${numberDisplay(
          topTracks.track.length,
          "track"
        )}`
      )
      .setDescription(
        filtered.length
          ? `Tracks matching ${keywords.code()}
\`\`\`
${filtered
  .slice(0, 25)
  .map((l) => `${l["@attr"].rank}. ${l.artist.name} - ${l.name}`)
  .join("\n")}
\`\`\``
          : `No results found for ${keywords.code()}!`
      );

    await this.send(embed);
  }
}
