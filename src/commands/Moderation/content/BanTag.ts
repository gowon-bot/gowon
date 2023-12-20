import { bold } from "../../../helpers/discord";
import { Variation } from "../../../lib/command/Command";
import { Flag } from "../../../lib/context/arguments/argumentTypes/Flag";
import { StringArgument } from "../../../lib/context/arguments/argumentTypes/StringArgument";
import { ArgumentsMap } from "../../../lib/context/arguments/types";
import { Validation } from "../../../lib/validation/ValidationChecker";
import { validators } from "../../../lib/validation/validators";
import { ServiceRegistry } from "../../../services/ServicesRegistry";
import { WordBlacklistService } from "../../../services/WordBlacklistService";
import { ContentModerationCommand } from "./ContentModerationCommand";

const args = {
  tag: new StringArgument({
    index: { start: 0 },
    required: true,
    description: "The tag to ban",
  }),
  regex: new Flag({
    default: false,
    description: "Can only be used by content moderators",
    longnames: ["regex"],
  }),
} satisfies ArgumentsMap;

export default class BanTag extends ContentModerationCommand<typeof args> {
  idSeed = "dreamnote boni";

  description = "Bans a tag from appearing in the server";
  usage = "tag";
  aliases = ["bt"];

  adminCommand = true;
  slashCommand = true;

  arguments = args;

  variations: Variation[] = [
    {
      name: "unban",
      variation: [
        "unban",
        "unbantag",
        "ubt",
        "globalunban",
        "globalunbantag",
        "gubt",
      ],
      description: "Unbans a tag",
    },
    {
      name: "global",
      variation: [
        "globalunban",
        "globalunbantag",
        "gubt",
        "gbt",
        "globalbantag",
      ],
      description: "Performs the ban or unban bot-wide",
    },
  ];

  validation: Validation = {
    tag: new validators.RequiredValidator({}),
  };

  wordBlacklistService = ServiceRegistry.get(WordBlacklistService);

  async run() {
    const { senderUser } = await this.getMentions();

    const tag = this.parsedArguments.tag;

    const unban = this.variationWasUsed("unban");
    const global = this.variationWasUsed("global");

    if (global) {
      this.access.checkAndThrow(senderUser);
    }

    await this.banOrUnban(tag, global);

    const embed = this.authorEmbed()
      .setHeader(`${unban ? "Unb" : "B"}an tag`)
      .setDescription(
        `Successfully ${unban ? "un" : ""}banned the tag: ${bold(tag)}${
          this.parsedArguments.regex ? " (regex)" : ""
        }${global ? " bot-wide" : ""}!`
      )
      .setFooter(
        `It will ${
          unban ? "now" : "no longer"
        } appear in places where tags are listed`
      );

    await this.send(embed);
  }

  private async banOrUnban(tag: string, global: boolean) {
    const guildID = global ? undefined : this.requiredGuild.id;

    if (this.variationWasUsed("unban")) {
      await this.wordBlacklistService.unbanTag(
        this.ctx,
        tag,
        guildID,
        global && this.parsedArguments.regex
      );
    } else {
      await this.wordBlacklistService.banTag(
        this.ctx,
        tag,
        guildID,
        global && this.parsedArguments.regex
      );
    }
  }
}
