import { JumbleChildCommand } from "./JumbleChildCommand";
import { Message } from "discord.js";
import { LogicError } from "../../../errors";
import { numberDisplay, abbreviateNumber, shuffle } from "../../../helpers";
import { JumbledArtist, jumbleRedisKey } from "./JumbleParentCommand";
import { Arguments } from "../../../lib/arguments/arguments";
import { Variation } from "../../../lib/command/BaseCommand";
import { LineConsolidator } from "../../../lib/LineConsolidator";
import { TagConsolidator } from "../../../lib/tags/TagConsolidator";
import { RunAs } from "../../../lib/command/RunAs";

const args = {
  inputs: {
    poolAmount: {
      index: 0,
      regex: /[0-9]{1,4}/g,
      default: 500,
      number: true,
    },
  },
} as const;

export class Me extends JumbleChildCommand<typeof args> {
  idSeed = "csvc stella jang";

  description =
    "Picks an artist from your library to jumble, or reshuffles your current one";
  usage = ["", "poolAmount"];
  variations: Variation[] = [
    {
      name: "nonascii",
      variation: "nonascii",
      description: "Allow artists with non-ascii characters to appear",
    },
  ];

  arguments: Arguments = args;

  tagConsolidator = new TagConsolidator();

  async run(message: Message, runAs: RunAs) {
    let alreadyJumbled = await this.sessionGetJSON<JumbledArtist>(
      message,
      jumbleRedisKey
    );

    if (alreadyJumbled?.jumbled) {
      this.handleAlreadyJumbled(message, alreadyJumbled);
      message.channel.stopTyping();
      return;
    }

    let poolAmount = this.parsedArguments.poolAmount!;

    if (poolAmount < 5 || poolAmount > 1000)
      throw new LogicError("Please enter a number between 5 and 1000!");

    let artist = await this.jumbleCalculator.getArtist(poolAmount, {
      nonAscii: runAs.variationWasUsed("nonascii"),
    });

    if (!artist)
      throw new LogicError("No suitable artists were found in your library!");

    let artistInfo = await this.lastFMService.artistInfo({
      artist: artist.name,
    });

    let jumbledArtist: JumbledArtist = {
      jumbled: this.jumble(artist.name),
      unjumbled: artist.name,
      currenthint: artist.name.replace(/[^\s]/g, this.hintChar),
    };

    this.sessionSetJSON(message, jumbleRedisKey, jumbledArtist);

    let tags = this.tagConsolidator
      .addArtistName(artist.name)
      .addTags(artistInfo.tags.tag)
      .consolidate();

    let lineConsolidator = new LineConsolidator();

    lineConsolidator.addLines(
      `This artist has **${abbreviateNumber(
        artistInfo.stats.listeners
      )}** listeners on Last.fm and you have scrobbled them **${numberDisplay(
        artist.playcount,
        "**time"
      )} (ranked #${numberDisplay(artist["@attr"].rank)}).`,
      {
        shouldDisplay: this.tagConsolidator.hasAnyTags(),
        string: `This artist is tagged as ${tags
          .slice(0, 2)
          .join(" as well as ")}`,
      },
      {
        shouldDisplay: !!artistInfo.similar.artist.length,
        string: `Last.fm considers ${artistInfo.similar.artist
          .map((a) => a.name.strong())
          .slice(0, 2)
          .join(" and ")} to be similar`,
      }
    );

    let embed = this.newEmbed()
      .setAuthor(
        `Jumble for ${message.member?.nickname || message.author.username}`,
        message.author.avatarURL() ?? ""
      )
      .setDescription(
        `**Who is this artist?**
      
      ${jumbledArtist.jumbled.code()}
      
      **Hints**:
      _${lineConsolidator.consolidate()}_`
      );

    await this.send(embed);
  }

  private async handleAlreadyJumbled(message: Message, jumble: JumbledArtist) {
    jumble.jumbled = this.jumble(jumble.unjumbled);

    this.sessionSetJSON(message, jumbleRedisKey, jumble);

    let embed = this.newEmbed().setAuthor(
      `Rejumble for ${message.member?.nickname || message.author.username}`,
      message.author.avatarURL() ?? ""
    ).setDescription(`I've reshuffled the letters, now who is this artist?
      
      ${jumble.jumbled.code()}`);

    await this.send(embed);
  }

  private jumble(artistName: string): string {
    let jumbled = artistName
      .split(/ /)
      .map((t) => shuffle(t.split("")).join(""))
      .join(" ")
      .toLowerCase();

    if (jumbled === artistName.toLowerCase()) {
      return this.jumble(artistName);
    }

    return jumbled;
  }
}
