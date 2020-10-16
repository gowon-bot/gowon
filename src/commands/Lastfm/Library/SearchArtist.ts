import { MessageEmbed } from "discord.js";
import { numberDisplay } from "../../../helpers";
import { Paginator } from "../../../lib/Paginator";
import { SearchCommand } from "./SearchCommand";

export default class SearchArtist extends SearchCommand {
  shouldBeIndexed = true;
  description = "Searches your top artists for keywords";
  aliases = ["sa", "sartist"];
  usage = ["keywords", "keywords @user"];

  async run() {
    let keywords = this.parsedArguments.keywords as string;

    let { username } = await this.parseMentions();

    let paginator = new Paginator(
      this.lastFMService.topArtists.bind(this.lastFMService),
      2,
      { username, limit: 1000 }
    );

    let topArtists = await paginator.getAll({ concatTo: "artist" });

    let filtered = topArtists.artist
      .filter((a) => this.clean(a.name).includes(this.clean(keywords)))
      .slice(0, 25)
      .sort((a, b) => a.name.localeCompare(b.name));

    let embed = new MessageEmbed()
      .setTitle(
        `Search results in ${username.code()}'s top ${numberDisplay(
          topArtists.artist.length,
          "artist"
        )}`
      )
      .setDescription(
        filtered.length
          ? `Artists matching ${keywords.code()}
\`\`\`
${filtered.map((f) => f.name).join("\n")}
\`\`\``
          : `No results found for ${keywords.code()}!`
      );

    await this.send(embed);
  }
}
