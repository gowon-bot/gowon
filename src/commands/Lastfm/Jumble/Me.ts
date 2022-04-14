import { JumbleChildCommand } from "./JumbleChildCommand";
import { LogicError } from "../../../errors/errors";
import { abbreviateNumber, shuffle } from "../../../helpers";
import { JumbledArtist, jumbleRedisKey } from "./JumbleParentCommand";
import { Variation } from "../../../lib/command/Command";
import { LineConsolidator } from "../../../lib/LineConsolidator";
import { TagConsolidator } from "../../../lib/tags/TagConsolidator";
import { displayNumber } from "../../../lib/views/displays";
import { ServiceRegistry } from "../../../services/ServicesRegistry";
import { WordBlacklistService } from "../../../services/WordBlacklistService";
import { NumberArgument } from "../../../lib/context/arguments/argumentTypes/NumberArgument";
import { GowonContext } from "../../../lib/context/Context";
import { Flag } from "../../../lib/context/arguments/argumentTypes/Flag";
import { bold, code } from "../../../helpers/discord";

const args = {
  poolAmount: new NumberArgument({
    default: 500,
    description:
      "The amount of top artists to pick a jumble from (defaults to 500)",
  }),
  nonAlphanumeric: new Flag({
    shortnames: ["nam"],
    longnames: ["nonalphanumeric", "nonalphanum"],
    description: "Include artists with non-alphanumeric names",
  }),
} as const;

export class Me extends JumbleChildCommand<typeof args> {
  idSeed = "csvc stella jang";

  description =
    "Picks an artist from your library to jumble, or reshuffles your current one";
  usage = ["", "poolAmount"];
  variations: Variation[] = [
    {
      name: "nonalphanumeric",
      variation: "nonalphanumeric",
      description: "Include artists with non-alphanumeric names",
    },
  ];

  arguments = args;

  slashCommand = true;

  tagConsolidator = new TagConsolidator();
  wordBlacklistService = ServiceRegistry.get(WordBlacklistService);

  async run() {
    let alreadyJumbled = await this.sessionGetJSON<JumbledArtist>(
      jumbleRedisKey
    );

    if (alreadyJumbled?.jumbled) {
      this.handleAlreadyJumbled(alreadyJumbled);
      return;
    }

    const poolAmount = this.parsedArguments.poolAmount;

    if (poolAmount < 5 || poolAmount > 1000)
      throw new LogicError("Please enter a number between 5 and 1000!");

    let artist = await this.jumbleCalculator.getArtist(poolAmount, {
      includeNonAlphanumeric:
        this.parsedArguments.nonAlphanumeric ||
        this.variationWasUsed("nonalphanumeric"),
    });

    if (!artist) {
      throw new LogicError("No suitable artists were found in your library!");
    }

    const { senderRequestable } = await this.getMentions();

    const artistInfo = await this.lastFMService.artistInfo(this.ctx, {
      artist: artist.name,
      username: senderRequestable,
    });

    let jumbledArtist: JumbledArtist = {
      jumbled: this.jumble(artist.name),
      unjumbled: artist.name,
      currenthint: artist.name.replace(/[^\s]/g, this.hintChar),
    };

    this.sessionSetJSON(jumbleRedisKey, jumbledArtist);

    await this.tagConsolidator.saveServerBannedTagsInContext(this.ctx);

    let tags = this.tagConsolidator
      .blacklistTags(artist.name)
      .addTags(this.ctx, artistInfo.tags)
      .consolidateAsStrings();

    let lineConsolidator = new LineConsolidator();

    lineConsolidator.addLines(
      `This artist has **${abbreviateNumber(artistInfo.listeners)}** listener${
        artistInfo.listeners === 1 ? "" : "s"
      } on Last.fm and you have scrobbled them **${displayNumber(
        artist.userPlaycount,
        "**time"
      )}.`,
      {
        shouldDisplay: this.tagConsolidator.hasAnyTags(),
        string: `This artist is tagged as ${tags
          .slice(0, 2)
          .join(" as well as ")}`,
      },
      {
        shouldDisplay: !!artistInfo.similarArtists.length,
        string: `Last.fm considers ${artistInfo.similarArtists
          .map((a) => bold(a.name))
          .slice(0, 2)
          .join(" and ")} to be similar`,
      }
    );

    let embed = this.newEmbed()
      .setAuthor(this.generateEmbedAuthor("Jumble"))
      .setDescription(
        `**Who is this artist?**
      
      ${code(jumbledArtist.jumbled)}
      
      **Hints**:
      _${lineConsolidator.consolidate()}_`
      )
      .setFooter({
        text: `Run "${this.prefix}j <your guess>" to make a guess or "${this.prefix}j quit" to quit`,
      });

    await this.send(embed);
  }

  private async handleAlreadyJumbled(jumble: JumbledArtist) {
    jumble.jumbled = this.jumble(jumble.unjumbled);

    this.sessionSetJSON(jumbleRedisKey, jumble);

    let embed = this.newEmbed()
      .setAuthor(this.generateEmbedAuthor("Jumble"))
      .setDescription(
        `I've reshuffled the letters, now who is this artist?\n\n${code(
          jumble.jumbled
        )}`
      )
      .setFooter({
        text: `Trying to skip? Run "${this.prefix}j quit" to give up`,
      });

    await this.send(embed);
  }

  private jumble(artistName: string): string {
    const jumbled = artistName
      .split(/ /)
      .map((t) => this.jumbleItem(t))
      .join(" ")
      .toLowerCase();

    if (jumbled === artistName.toLowerCase()) {
      return this.jumble(artistName);
    }

    return jumbled;
  }

  private jumbleItem(item: string): string {
    const jumbled = shuffle(item.split("")).join("");

    if (item.length == 1) {
      return item;
    }

    return jumbled === item ||
      !this.wordBlacklistService.isAllowed(this.ctx as GowonContext, item)
      ? this.jumbleItem(item)
      : jumbled;
  }
}
