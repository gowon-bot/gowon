import { FishyNotFoundError } from "../../errors/fishy";
import { bold, italic } from "../../helpers/discord";
import { emDash, quote } from "../../helpers/specialCharacters";
import { StringArgument } from "../../lib/context/arguments/argumentTypes/StringArgument";
import { EmojisArgument } from "../../lib/context/arguments/argumentTypes/discord/EmojisArgument";
import { standardMentions } from "../../lib/context/arguments/mentionTypes/mentions";
import { ArgumentsMap } from "../../lib/context/arguments/types";
import { validators } from "../../lib/validation/validators";
import { displayNumber } from "../../lib/views/displays";
import { findFishy } from "../../services/fishy/fishyList";
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
  ...standardMentions,
} satisfies ArgumentsMap;

export class Fishypedia extends FishyChildCommand<typeof args> {
  idSeed = "le sserafim eunchae";
  aliases = ["info", "wiki"];

  description = "See information about a fish";

  arguments = args;

  validation = {
    fishy: {
      validator: new validators.RequiredOrValidator({}),
      dependsOn: ["fishyEmoji"],
      friendlyName: "fishy name or emoji ",
    },
  };

  async run() {
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
      : findFishy(fishyName!);

    if (!fishy) throw new FishyNotFoundError(fishyEmoji?.[0] || fishyName);

    const fishyCount = fishyProfile
      ? await this.fishyService.countFishy(fishyProfile, fishy)
      : 0;

    let embed = this.newEmbed()
      .setAuthor(this.generateEmbedAuthor("Fishy wiki"))
      .setColor(fishy.rarity.colour)
      .setTitle(fishy.name)
      .setDescription(
        `
${fishy.emoji} ${bold(italic(fishy.binomialName), false)} ${emDash} ${
          fishy.rarity.isTrash()
            ? fishy.rarity.name
            : `${fishy.rarity.name} fishy`
        } 

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
      embed = embed.addField(
        "Weight",
        `${fishy.minWeight}-${fishy.maxWeight}kg`
      );
    }

    await this.send(embed);
  }
}
