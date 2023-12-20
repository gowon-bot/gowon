import { Message, MessageCollector } from "discord.js";
import {
  InvalidJumblePoolAmountError,
  NoSuitableArtistsFoundForJumbleError,
} from "../../../errors/commands/jumble";
import { abbreviateNumber, shuffle } from "../../../helpers";
import { bold, code } from "../../../helpers/discord";
import { LineConsolidator } from "../../../lib/LineConsolidator";
import { Variation } from "../../../lib/command/Command";
import { CommandRegistry } from "../../../lib/command/CommandRegistry";
import { CommandExtractor } from "../../../lib/command/extractor/CommandExtractor";
import { GowonContext } from "../../../lib/context/Context";
import { Flag } from "../../../lib/context/arguments/argumentTypes/Flag";
import { NumberArgument } from "../../../lib/context/arguments/argumentTypes/NumberArgument";
import { ArgumentsMap } from "../../../lib/context/arguments/types";
import { TagConsolidator } from "../../../lib/tags/TagConsolidator";
import { displayNumber } from "../../../lib/views/displays";
import { ServiceRegistry } from "../../../services/ServicesRegistry";
import { WordBlacklistService } from "../../../services/WordBlacklistService";
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

export class Start extends JumbleChildCommand<typeof args> {
  idSeed = "csvc stella jang";

  aliases = ["me", "begin"];
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
  commandExtractor = new CommandExtractor();
  wordBlacklistService = ServiceRegistry.get(WordBlacklistService);

  async run() {
    const poolAmount = this.parsedArguments.poolAmount;

    const alreadyJumbled = await this.sessionGetJSON<JumbledArtist>(
      jumbleRedisKey
    );

    if (alreadyJumbled?.jumbled) {
      this.handleAlreadyJumbled(alreadyJumbled);
      return;
    }

    if (poolAmount < 5 || poolAmount > 1000) {
      throw new InvalidJumblePoolAmountError();
    }

    const artist = await this.jumbleCalculator.getArtist(poolAmount, {
      includeNonAlphanumeric:
        this.parsedArguments.nonAlphanumeric ||
        this.variationWasUsed("nonalphanumeric"),
    });

    if (!artist) {
      throw new NoSuitableArtistsFoundForJumbleError();
    }

    const { senderRequestable } = await this.getMentions();

    const artistInfo = await this.lastFMService.artistInfo(this.ctx, {
      artist: artist.name,
      username: senderRequestable,
    });

    const jumbledArtist: JumbledArtist = {
      jumbled: this.jumble(artist.name),
      unjumbled: artist.name,
      currenthint: artist.name.replace(/[^\s]/g, this.hintChar),
    };

    this.sessionSetJSON(jumbleRedisKey, jumbledArtist);

    await this.tagConsolidator.saveServerBannedTagsInContext(this.ctx);

    const tags = this.tagConsolidator
      .blacklistTags(artist.name)
      .addTags(this.ctx, artistInfo.tags)
      .consolidateAsStrings();

    const lineConsolidator = new LineConsolidator();

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

    const embed = this.authorEmbed()
      .setHeader("Jumble me")
      .setDescription(
        `**Who is this artist?**
      
      ${code(jumbledArtist.jumbled)}
      
      **Hints**:
      _${lineConsolidator.consolidate()}_`
      )
      .setFooter(
        `Send a message to make a guess or type "quit" to quit\nType "hint" to get a hint`
      );

    await this.send(embed);

    this.watchForAnswers(jumbledArtist);
  }

  private async handleAlreadyJumbled(jumble: JumbledArtist) {
    jumble.jumbled = this.jumble(jumble.unjumbled);

    this.sessionSetJSON(jumbleRedisKey, jumble);

    const embed = this.authorEmbed()
      .setHeader("Jumble reshuffle")
      .setDescription(
        `I've reshuffled the letters, now who is this artist?\n\n${code(
          jumble.jumbled
        )}`
      )
      .setFooter(
        `Trying to skip? Type "quit" to give up\nNeed a hint? Type "hint" to get a hint`
      );

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

  private jumbleItem(item: string, tries = 0): string {
    const jumbled = shuffle(item.split("")).join("");

    if (item.length == 1 || tries > this.maximumJumbleTries) {
      return item;
    }

    if (
      jumbled === item ||
      !this.wordBlacklistService.isAllowed(this.ctx as GowonContext, item)
    ) {
      return this.jumbleItem(item, tries + 1);
    } else return jumbled;
  }

  private watchForAnswers(jumble: JumbledArtist) {
    const messageCollector = new MessageCollector(this.ctx.payload.channel, {
      time: 60 * 2 * 1000,
      filter: (message) => message.author.id === this.author.id,
    });

    messageCollector.on("collect", async (message) => {
      await this.handleAnswerMessage(message, jumble, messageCollector);
    });

    messageCollector.on("end", async (_message, reason) => {
      if (reason === "time") {
        this.redisService.sessionDelete(this.ctx, jumbleRedisKey);

        const embed = this.authorEmbed()
          .setHeader("Jumble")
          .setDescription(
            `You ran out of time! The answer was ${bold(jumble.unjumbled)}`
          );

        await this.send(embed);
      }
    });
  }

  private async handleAnswerMessage(
    message: Message,
    jumble: JumbledArtist,
    messageCollector: MessageCollector
  ): Promise<void> {
    const normalizedMessageInput = message.content
      .toLowerCase()
      .trim()
      .replaceAll(/\s+/g, " ");

    const extractedCommand = await this.commandExtractor.extract(
      normalizedMessageInput,
      this.guild?.id,
      CommandRegistry.getInstance().list()
    );

    // If jumble begin is being run again, don't respond
    if (extractedCommand?.command?.id === this.id) {
      return;
    }

    if (this.isGuessCorrect(message.content, jumble.unjumbled)) {
      await this.handleCorrectGuess(jumble.unjumbled, jumbleRedisKey);
      messageCollector.stop();
    } else if (
      ["stop", "quit", "cancel", "give up"].some((quitWord) =>
        normalizedMessageInput.includes(quitWord)
      )
    ) {
      this.stopJumble(jumble.unjumbled, jumbleRedisKey);
      messageCollector.stop();
    } else if (normalizedMessageInput === "hint") {
      await this.giveHint(jumble, jumbleRedisKey);
    } else {
      message.react(shuffle(this.wrongAnswerEmojis)[0]);
    }
  }
}
