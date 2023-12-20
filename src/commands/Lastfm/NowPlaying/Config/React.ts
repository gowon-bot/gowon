import { LogicError } from "../../../../errors/errors";
import { extraWideSpace } from "../../../../helpers/specialCharacters";
import { LineConsolidator } from "../../../../lib/LineConsolidator";
import { Flag } from "../../../../lib/context/arguments/argumentTypes/Flag";
import { StringArgument } from "../../../../lib/context/arguments/argumentTypes/StringArgument";
import { EmojisArgument } from "../../../../lib/context/arguments/argumentTypes/discord/EmojisArgument";
import { EmojiMention } from "../../../../lib/context/arguments/parsers/EmojiParser";
import { ArgumentsMap } from "../../../../lib/context/arguments/types";
import { extractEmojiName } from "../../../../lib/emoji/Emoji";
import { SettingsService } from "../../../../lib/settings/SettingsService";
import { ConfirmationEmbed } from "../../../../lib/views/embeds/ConfirmationEmbed";
import { EmojiService } from "../../../../services/Discord/EmojiService";
import { ServiceRegistry } from "../../../../services/ServicesRegistry";
import { NowPlayingConfigChildCommand } from "./NowPlayingConfigChildCommand";

const args = {
  clearInput: new StringArgument({
    match: ["clear"],
    slashCommandOption: false,
  }),
  clear: new Flag({
    shortnames: ["c"],
    longnames: ["clear"],
    description: "Clear your reacts",
  }),
  emojis: new EmojisArgument({
    index: { start: 0 },
    default: [],
    description: "The emojis Gowon will react to your fms with",
  }),
} satisfies ArgumentsMap;

export class React extends NowPlayingConfigChildCommand<typeof args> {
  idSeed = "shasha seoyeon";

  aliases = ["reacts", "reactions"];
  description =
    "Set what emojis Gowon should react with when you `!fm`\nUse `react clear` to clear your reacts";
  usage = ["", "emoji1 emoji2 ...emoji5", "clear"];

  arguments = args;

  slashCommand = true;

  settingsService = ServiceRegistry.get(SettingsService);
  emojiService = ServiceRegistry.get(EmojiService);

  async run() {
    const emojis = this.parsedArguments.emojis;
    const clear = this.parsedArguments.clearInput;

    if (clear?.toLowerCase() === "clear" || this.parsedArguments.clear) {
      return this.handleClear();
    } else if (emojis.length) {
      await this.saveReacts(emojis);
    } else {
      const reactions = JSON.parse(
        this.settingsService.get("reacts", {
          userID: this.author.id,
        }) || "[]"
      ) as string[];

      const embed = this.authorEmbed()
        .setHeader("Reacts")
        .setDescription(
          `Choose which reactions Gowon should react with when you \`${this.prefix}fm\`.\nSet them with \`${this.prefix}reacts emoji1 emoji2 ...emoji5\` and use \`${this.prefix}reacts clear\` to clear them!` +
            (reactions.length
              ? `\n\n**You have the following reactions set**:\n${reactions
                  .map((r) => this.gowonClient.displayEmoji(r))
                  .join(extraWideSpace)}`
              : "")
        );

      await this.send(embed);
    }
  }

  private async handleClear() {
    const embed = this.authorEmbed()
      .setHeader("Nowplaying config reacts")
      .setDescription("Are you sure you want to clear your reacts?");

    const confirmationEmbed = new ConfirmationEmbed(this.ctx, embed);

    if (await confirmationEmbed.awaitConfirmation(this.ctx)) {
      await this.settingsService.set(this.ctx, "reacts", {
        userID: this.author.id,
      });
      confirmationEmbed.sentMessage!.edit({
        embeds: [
          embed
            .setDescription("Successfully cleared your reactions!")
            .asMessageEmbed(),
        ],
      });
    }
  }

  private async saveReacts(emojis: EmojiMention[]) {
    const { valid, invalid } = await this.emojiService.validateEmojis(
      this.ctx,
      emojis
    );

    if (valid.length > 5) {
      throw new LogicError("You can't have more than 5 reactions!");
    } else if (valid.length) {
      this.settingsService.set(
        this.ctx,
        "reacts",
        { userID: this.author.id },
        JSON.stringify(valid.map((e) => e.resolvable))
      );
    }

    const lineConsolidator = new LineConsolidator();
    lineConsolidator.addLines(
      {
        shouldDisplay: !!valid.length,
        string: `**Gowon will react with the following emojis**:\n${valid
          .map((e) => e.raw)
          .join(extraWideSpace)}`,
      },
      {
        shouldDisplay: !!valid.length && !!invalid.length,
        string: "",
      },
      {
        shouldDisplay: !!invalid.length,
        string: `**Ignored the following emojis**:\n${invalid
          .map((e) => extractEmojiName(e.raw))
          .join(extraWideSpace)}`,
      }
    );

    const embed = this.authorEmbed()
      .setHeader("Reacts")
      .setDescription(lineConsolidator.consolidate());

    if (invalid.length) {
      embed.setFooter(
        "Gowon needs to share a server with an emoji to be able to react with it"
      );
    }

    await this.send(embed);
  }
}
