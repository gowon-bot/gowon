import { Message, MessageEmbed } from "discord.js";
import { Arguments } from "../../../lib/arguments/arguments";
import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { Variation } from "../../../lib/command/BaseCommand";
import { RunAs } from "../../../lib/AliasChecker";
import { LogicError } from "../../../errors";

export default class RegexArtistSearch extends LastFMBaseCommand {
  aliases = ["regexas", "ras"];
  description =
    "Searches your top artists for an artist that match a given regex\nRegex help: https://regexr.com/";
  subcategory = "library stats";
  usage = ["regex"]

  arguments: Arguments = {
    mentions: {
      user: {
        index: 0,
        description: "The user to lookup",
        nonDiscordMentionParsing: this.ndmp,
      },
    },
    inputs: {
      regex: { index: { start: 0 } },
    },
  };
  variations: Variation[] = [
    {
      variationRegex: /(regexas|ras|regexartistsearch)[0-9]{1,3}/i,
      description: "Offset in pages",
      friendlyString: "ras<page_number>"
    },
  ];

  async run(message: Message, runAs: RunAs) {
    let { username, perspective } = await this.parseMentionedUsername(message);

    let page = 1;

    if (runAs) {
      page = runAs.lastString().slice(2).toInt() || 1;
    }

    let regex = this.parsedArguments.regex as string;

    if (!regex) throw new LogicError("please enter a valid regex!");

    let parsedRegex: RegExp | undefined;
    try {
      parsedRegex = new RegExp(regex, "i");
    } catch (e) {
      if (!(e instanceof SyntaxError)) throw e;
    }

    if (parsedRegex) {
      let topArtists = await this.lastFMService.topArtists(
        username,
        1000,
        page
      );

      let tracks = topArtists.artist.filter((a) => parsedRegex!.test(a.name));

      if (tracks.length) {
        let embed = new MessageEmbed()
          .setTitle(
            `Artists in ${
              perspective.possessive
            } library that match ${regex.code()} ${
              tracks.length > 25 ? "(showing only top 20)" : ""
            }`
          )
          .setDescription(
            tracks
              .slice(0, 25)
              .map((t) => `${t.name.bold()} _(${t.playcount} plays)_`)
              .join("\n")
          );

        await message.channel.send(embed);
      } else {
        await message.reply(
          `no artists were found with the regex ${regex.code()} for ${
            perspective.name
          }`
        );
      }
    } else {
      throw new LogicError(`the regex ${regex.code()} is not valid`);
    }
  }
}
