import { MessageEmbed } from "discord.js";
import { LogicError } from "../../../errors";
import { numberDisplay } from "../../../helpers";
import { Paginator } from "../../../lib/Paginator";
import { SearchCommand } from "./SearchCommand";

export default class SearchAlbum extends SearchCommand {
  shouldBeIndexed = true;
  description = "Searches your top albums for keywords";
  aliases = ["sl", "sal", "salbum"];
  usage = ["keywords", "keywords @user"];

  async run() {
    let keywords = this.parsedArguments.keywords as string;

    let { username } = await this.parseMentions();

    let paginator = new Paginator(
      this.lastFMService.topAlbums.bind(this.lastFMService),
      2,
      { username, limit: 1000 }
    );

    let topAlbums = await paginator.getAll({ concatTo: "album" });

    let filtered = topAlbums.album.filter((a) =>
      this.clean(a.name).includes(this.clean(keywords))
    );

    if (filtered.length !== 0 && filtered.length === topAlbums.album.length) {
      throw new LogicError(
        "too many search results, try narrowing down your query..."
      );
    }

    let embed = new MessageEmbed()
      .setTitle(
        `Search results in ${username.code()}'s top ${numberDisplay(
          topAlbums.album.length,
          "album"
        )}`
      )
      .setDescription(
        filtered.length
          ? `Albums matching ${keywords.code()}
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
