import { BaseCommand, Variation } from "../../BaseCommand";
import { Message, MessageEmbed } from "discord.js";
import { Arguments } from "../../arguments";

export default class RegexTrackSearch extends BaseCommand {
  aliases = ["regexts", "ts"];
  description =
    "Searches your top tracks for tracks that match a given regex\nRegex help: https://regexr.com/";
  arguments: Arguments = {
    mentions: {
      0: { name: "user", description: "the user to lookup" },
    },
    inputs: {
      regex: { index: { start: 0 } },
    },
  };
  variations: Variation[] = [
    {
      variationRegex: /(ts|regexts|regextracksearch)[0-9]{1,3}/i,
      description: "Offset in pages",
    },
  ];

  async run(message: Message, runAs?: string) {
    let { username, perspective } = await this.parseMentionedUsername(message);

    let page = 1;

    if (runAs) {
      page = parseInt(runAs.slice(2)) || 1;
    }

    let regex = this.parsedArguments.regex as string;

    let parsedRegex: RegExp | undefined;
    try {
      parsedRegex = new RegExp(regex, "i");
    } catch (e) {
      if (!(e instanceof SyntaxError)) throw e;
    }

    if (parsedRegex) {
      let topTracks = await this.lastFMService.topTracks(username, 1000, page);

      let tracks = topTracks.track
        .filter((t) => parsedRegex!.test(t.name))
        .slice(0, 10);

      if (tracks.length) {
        let embed = new MessageEmbed()
        .setTitle(`Tracks in ${perspective.possessive} library that match \`${regex}\``)
        .setDescription(
          tracks
            .map(
              (t) =>
                `**${t.name}** by ${t.artist.name} _(${t.playcount} plays)_`
            )
            .join("\n")
        );

        await message.channel.send(embed);
      } else {
        await message.reply(
          `no tracks were found with the regex \`${regex}\` for ${perspective.name}`
        );
      }
    } else {
      await message.reply(`the regex \`${regex}\` is not valid`);
    }
  }
}
