import { FishyNotFoundError } from "../../errors/commands/fishy";
import { bold, italic } from "../../helpers/discord";
import { emDash, quote } from "../../helpers/specialCharacters";
import { StringArgument } from "../../lib/context/arguments/argumentTypes/StringArgument";
import { EmojisArgument } from "../../lib/context/arguments/argumentTypes/discord/EmojisArgument";
import { standardMentions } from "../../lib/context/arguments/mentionTypes/mentions";
import { ArgumentsMap } from "../../lib/context/arguments/types";
import { displayNumber } from "../../lib/views/displays";
import { SimpleScrollingEmbed } from "../../lib/views/embeds/SimpleScrollingEmbed";
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

    const embed = this.newEmbed()
      .setAuthor(this.generateEmbedAuthor("Fishy wiki"))
      .setColor(fishy.rarity.colour)
      .setTitle(fishy.name)
      .setURL(fishy.url)
      .setDescription(
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
      embed.addField("Weight", `${fishy.minWeight}-${fishy.maxWeight}kg`);
    }

    await this.send(embed);
  }

  private async listFishy(trait: FishyTrait) {
    const fishy = fishyList.filter(
      (f) => !f.rarity.special && matchesFishyTrait(f, trait)
    );

    const embed = this.newEmbed()
      .setAuthor(this.generateEmbedAuthor("Fishy wiki"))
      .setTitle(`Search results for ${displayFishyTrait(trait, true)}`);

    const simpleScrollingEmbed = new SimpleScrollingEmbed(this.ctx, embed, {
      items: fishy.map(
        (f) =>
          `${f.rarity.emoji.forLevel(f.requiredFishyLevel)} ${
            f.emoji
          } ${emDash} ${bold(f.name)} (${f.binomialName})`
      ),
      pageSize: 15,
    });

    simpleScrollingEmbed.send();
  }
}
