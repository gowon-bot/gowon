import { MessageCollector } from "discord.js";
import { LogicError } from "../../../errors/errors";
import { bold, code } from "../../../helpers/discord";
import { shuffle } from "../../../helpers/native/array";
import { abbreviateNumber } from "../../../helpers/native/number";
import { LineConsolidator } from "../../../lib/LineConsolidator";
import { Variation } from "../../../lib/command/Command";
import { GowonContext } from "../../../lib/context/Context";
import { Flag } from "../../../lib/context/arguments/argumentTypes/Flag";
import { NumberArgument } from "../../../lib/context/arguments/argumentTypes/NumberArgument";
import { ArgumentsMap } from "../../../lib/context/arguments/types";
import { TagConsolidator } from "../../../lib/tags/TagConsolidator";
import { displayNumber } from "../../../lib/views/displays";
import { ServiceRegistry } from "../../../services/ServicesRegistry";
import { TagBlacklistService } from "../../../services/moderation/TagBlacklistService";
import { JumbleChildCommand } from "./JumbleChildCommand";
import { JumbledArtist, jumbleRedisKey } from "./JumbleParentCommand";

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
} satisfies ArgumentsMap;

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
  slashCommandName = "start";

  tagConsolidator = new TagConsolidator();
  tagBlacklistService = ServiceRegistry.get(TagBlacklistService);

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

    await this.tagConsolidator.saveBannedTagsInContext(this.ctx);

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
        text: `Simply send a message to make a guess or type "quit" to quit`,
      });

    await this.send(embed);

    this.watchForAnswers(jumbledArtist);
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
      !this.tagBlacklistService.isAllowed(this.ctx as GowonContext, item)
      ? this.jumbleItem(item)
      : jumbled;
  }

  private watchForAnswers(jumble: JumbledArtist) {
    const messageCollector = new MessageCollector(this.ctx.payload.channel, {
      time: 60 * 2 * 1000,
      filter: (message) => message.author.id === this.author.id,
    });

    messageCollector.on("collect", async (message) => {
      if (
        ["stop", "quit", "cancel"].includes(
          message.content.toLowerCase().trim()
        )
      ) {
        this.stopJumble(jumble.unjumbled, jumbleRedisKey);
        messageCollector.stop();
      } else if (this.isGuessCorrect(message.content, jumble.unjumbled)) {
        await this.handleCorrectGuess(jumble.unjumbled, jumbleRedisKey);
        messageCollector.stop();
      } else {
        message.react(shuffle(this.wrongAnswerEmojis)[0]);
      }
    });

    messageCollector.on("end", async (_message, reason) => {
      if (reason === "time") {
        this.redisService.sessionDelete(this.ctx, jumbleRedisKey);

        const embed = this.newEmbed()
          .setAuthor(this.generateEmbedAuthor("Jumble"))
          .setDescription(
            `You ran out of time! The answer was ${bold(jumble.unjumbled)}`
          );

        await this.send(embed);
      }
    });
  }
}
