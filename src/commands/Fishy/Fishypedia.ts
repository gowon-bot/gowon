import { FishyNotFoundError } from "../../errors/commands/fishy";
import { bold, italic } from "../../helpers/discord";
import { bullet, emDash, quote } from "../../helpers/specialCharacters";
import { Perspective } from "../../lib/Perspective";
import { StringArgument } from "../../lib/context/arguments/argumentTypes/StringArgument";
import { EmojisArgument } from "../../lib/context/arguments/argumentTypes/discord/EmojisArgument";
import { standardMentions } from "../../lib/context/arguments/mentionTypes/mentions";
import { ArgumentsMap } from "../../lib/context/arguments/types";
import { EmojiRaw } from "../../lib/emoji/Emoji";
import { displayNumber } from "../../lib/ui/displays";
import { EmbedView } from "../../lib/ui/views/EmbedView";
import { ScrollingListView } from "../../lib/ui/views/ScrollingListView";
import { TabbedView, TabbedViewTab } from "../../lib/ui/views/TabbedView";
import { Fishy } from "../../services/fishy/Fishy";
import { findFishy, fishyList } from "../../services/fishy/fishyList";
import {
  FishyTrait,
  convertFishyTrait,
  displayFishyTrait,
  matchesFishyTrait,
} from "../../services/fishy/traits";
import { FishyChildCommand } from "./FishyChildCommand";

const args = {
  fishy: new StringArgument({
    index: { start: 0 },
    description: "The fishy name to learn about",
  }),
  fishyEmoji: new EmojisArgument({
    index: { start: 0 },
    description: "The fishy emoji to learn about",
  }),
  fishyTrait: new StringArgument({
    index: { start: 0 },
    description: "The fishy trait to list fish",
    preprocessor: (s) => s.toLowerCase(),
  }),
  ...standardMentions,
} satisfies ArgumentsMap;

export class Fishypedia extends FishyChildCommand<typeof args> {
  idSeed = "le sserafim eunchae";
  aliases = ["info", "wiki"];

  description = "See information about a fish";

  usage = ["fishyname", ":fishyemoji:"];

  arguments = args;

  async run() {
    const fishyTrait = convertFishyTrait(this.parsedArguments.fishyTrait);

    if (fishyTrait) {
      await this.listFishy(fishyTrait);
      return;
    }

    const { fishyProfile, discordUser } = await this.getMentions({
      fetchFishyProfile: true,
      fetchDiscordUser: true,
    });

    const perspective = this.usersService.discordPerspective(
      this.author,
      discordUser
    );

    const fishyName = this.parsedArguments.fishy;
    const fishyEmoji = this.parsedArguments.fishyEmoji;

    const fishy = fishyEmoji?.length
      ? findFishy({ byEmoji: fishyEmoji[0].raw })
      : fishyName
      ? findFishy(fishyName)
      : fishyProfile
      ? (await this.fishyService.getLastCatch(fishyProfile))?.fishy
      : undefined;

    if (!fishy) throw new FishyNotFoundError(fishyEmoji?.[0] || fishyName);

    const fishyCount = fishyProfile
      ? await this.fishyService.countFishy(fishyProfile, fishy)
      : 0;

    const mainTab: TabbedViewTab = {
      name: "main",
      rawEmoji: EmojiRaw.fishypediaMainTab,
      embed: this.getMainTabEmbed(fishy, fishyCount, perspective),
    };

    const traitsTab: TabbedViewTab = {
      name: "traits",
      rawEmoji: EmojiRaw.fishypediaTraitsTab,
      embed: this.getTraitsTabEmbed(fishy),
    };

    const tabbedEmbed = new TabbedView(this.ctx, {
      tabs: fishy.traits.length ? [mainTab, traitsTab] : [mainTab],
    });

    await this.reply(tabbedEmbed);
  }

  private getMainTabEmbed(
    fishy: Fishy,
    fishyCount: number,
    perspective: Perspective
  ): EmbedView {
    const embed = this.getBaseTabEmbed(fishy).setDescription(
      `
${fishy.emoji} ${bold(italic(fishy.binomialName), false)}
${fishy.rarity.emoji.forLevel(fishy.requiredFishyLevel)} Level ${
        fishy.requiredFishyLevel
      } ${fishy.rarity.name} fishy

${italic(quote(fishy.description))}

${
  fishyCount > 0
    ? `${perspective.upper.plusToHave} caught this fish ${bold(
        displayNumber(fishyCount, "time")
      )}.`
    : `${perspective.upper.plusToHave} never caught this fish.`
}`
    );

    if (!fishy.rarity.isTrash()) {
      embed.addFields({
        name: "Weight",
        value: `${fishy.minWeight}-${fishy.maxWeight}kg`,
      });
    }

    return embed;
  }

  private getTraitsTabEmbed(fishy: Fishy): EmbedView {
    return this.getBaseTabEmbed(fishy).setDescription(
      `**Traits**:
 ${fishy.traits.map((t) => `${bullet} ${displayFishyTrait(t)}`).join("\n")}`
    );
  }

  private getBaseTabEmbed(fishy: Fishy): EmbedView {
    return this.minimalEmbed()
      .setHeader("Fishypedia")
      .setColour(fishy.rarity.colour)
      .setTitle(fishy.name)
      .setURL(fishy.url);
  }

  private async listFishy(trait: FishyTrait) {
    const fishy = fishyList.filter(
      (f) => !f.rarity.special && matchesFishyTrait(f, trait)
    );

    const embed = this.minimalEmbed().setTitle(
      `Fishypedia search results for ${displayFishyTrait(trait, true)}`
    );

    const simpleScrollingEmbed = new ScrollingListView(this.ctx, embed, {
      items: fishy.map(
        (f) =>
          `${f.rarity.emoji.forLevel(f.requiredFishyLevel)} ${
            f.emoji
          } ${emDash} ${bold(f.name)} (${f.binomialName})`
      ),
      pageSize: 15,
    });

    await this.reply(simpleScrollingEmbed);
  }
}
