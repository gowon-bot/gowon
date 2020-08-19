import { Message, MessageEmbed } from "discord.js";
import { Arguments } from "../../../lib/arguments/arguments";
import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { Variation } from "../../../lib/command/BaseCommand";
import { RunAs } from "../../../lib/AliasChecker";
import { LogicError } from "../../../errors";

export default class RegexAlbumSearch extends LastFMBaseCommand {
  aliases = ["regexls", "regexals", "rls", "rals"];
  description =
    "Searches your top albums for albums that match a given regex\nRegex help: https://regexr.com/";
  subcategory = "library stats";
  usage = ["regex"];

  shouldBeIndexed = false;

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
      variationRegex: /(regexls|regexals|rls|rals)[0-9]{1,3}/i,
      description: "Offset in pages",
      friendlyString: "rls<page_number>",
    },
  ];

  async run(message: Message, runAs: RunAs) {
    let { username, perspective } = await this.parseMentionedUsername(message);

    let page = (runAs.lastString().match("[0-9]{1,3}") || [])[0]?.toInt() || 1;

    let regex = this.parsedArguments.regex as string;

    if (!regex) throw new LogicError("please enter a valid regex!");

    let parsedRegex: RegExp | undefined;
    try {
      parsedRegex = new RegExp(regex, "i");
    } catch (e) {
      if (!(e instanceof SyntaxError)) throw e;
    }

    if (parsedRegex) {
      let topAlbums = await this.lastFMService.topAlbums({
        username,
        limit: 1000,
        page,
      });

      let albums = topAlbums.album.filter((t) => parsedRegex!.test(t.name));

      if (albums.length) {
        let embed = new MessageEmbed()
          .setTitle(
            `Albums in ${
              perspective.possessive
            } library that match ${regex.code()} ${
              albums.length > 25 ? "(showing only top 20)" : ""
            }`
          )
          .setDescription(
            albums
              .slice(0, 25)
              .map(
                (al) =>
                  `${al.name.bold()} by ${al.artist.name} _(${
                    al.playcount
                  } plays)_`
              )
              .join("\n")
          );

        await message.channel.send(embed);
      } else {
        await message.reply(
          `no albums were found with the regex ${regex.code()} for ${
            perspective.name
          }`
        );
      }
    } else {
      await message.reply(`the regex ${regex.code()} is not valid`);
    }
  }
}
