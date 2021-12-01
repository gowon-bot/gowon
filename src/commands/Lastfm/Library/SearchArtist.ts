import { LogicError } from "../../../errors";
import { Variation } from "../../../lib/command/BaseCommand";
import { Paginator } from "../../../lib/paginators/Paginator";
import { displayNumber } from "../../../lib/views/displays";
import { SimpleScrollingEmbed } from "../../../lib/views/embeds/SimpleScrollingEmbed";
import { SearchCommand } from "./SearchCommand";

export default class SearchArtist extends SearchCommand {
  idSeed = "gwsn minju";

  shouldBeIndexed = true;
  description = "Searches your top artists for keywords";
  aliases = ["sa", "sartist"];
  usage = ["keywords", "keywords @user"];

  variations: Variation[] = [
    {
      name: "deep",
      variation: ["deepsa", "dsa"],
      description: "Searches your top 4000 artists (instead of 2000)",
    },
  ];

  async run() {
    let keywords = this.parsedArguments.keywords!;

    const { requestable, perspective } = await this.parseMentions();

    const paginator = new Paginator(
      this.lastFMService.topArtists.bind(this.lastFMService),
      this.variationWasUsed("deep") ? 4 : 2,
      { username: requestable, limit: 1000 },
      this.ctx
    );

    const topArtists = await paginator.getAllToConcatonable({
      concurrent: this.variationWasUsed("deep"),
    });

		const filteredKeywords = {
			whitespace: (await this.clean(keywords, true)).text,
			noWhitespace: (await this.clean(keywords, true)).text.replace(/\s+/g, "")
		}

    const filtered = await this.asyncFilter(topArtists.artists, async (a) => {

			const currentString = (await this.clean(a.name, false));
			let currentKeywords = "";
			if (currentString.noWhitespace) {
				currentKeywords = filteredKeywords.noWhitespace;
			} else {
				currentKeywords = filteredKeywords.whitespace;
			}
			return currentString.text.includes(currentKeywords);
		});

    if (
      filtered.length !== 0 &&
      filtered.length === topArtists.artists.length
    ) {
      throw new LogicError(
        "too many search results, try narrowing down your query..."
      );
    }

    const embed = this.newEmbed().setTitle(
      `Search results in ${perspective.possessive} top ${displayNumber(
        topArtists.artists.length,
        "artist"
      )}`
    );

    if (!filtered.length) {
      embed.setDescription(`No results found for ${keywords.code()}!`);
      await this.send(embed);
      return;
    }

    const scrollingEmbed = new SimpleScrollingEmbed(
      this.message,
      embed,
      {
        items: filtered,
        pageSize: 15,
        pageRenderer(items) {
          return `Artists matching ${keywords.code()}
\`\`\`\n${items.map((a) => `${a.rank}.` + a.name).join("\n")}\`\`\``;
        },
      },
      {
        itemName: "result",
      }
    );

    scrollingEmbed.send();
  }
}
