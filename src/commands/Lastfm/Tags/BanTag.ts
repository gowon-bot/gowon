import { Arguments } from "../../../lib/arguments/arguments";
import { Variation } from "../../../lib/command/BaseCommand";
import { Validation } from "../../../lib/validation/ValidationChecker";
import { validators } from "../../../lib/validation/validators";
import { ServiceRegistry } from "../../../services/ServicesRegistry";
import { WordBlacklistService } from "../../../services/WordBlacklistService";
import { LastFMBaseCommand } from "../LastFMBaseCommand";

const args = {
  inputs: {
    tag: { index: { start: 0 } },
  },
} as const;

export default class BanTag extends LastFMBaseCommand<typeof args> {
  idSeed = "dreamnote boni";

  description = "Bans a tag from appearing in the server";
  usage = "tag";
  aliases = ["bt"];

  adminCommand = true;

  arguments: Arguments = args;

  variations: Variation[] = [
    {
      name: "unban",
      variation: ["unban", "unbantag", "ubt"],
      description: "Unbans a tag",
    },
  ];

  validation: Validation = {
    tag: new validators.Required({}),
  };

  wordBlacklistService = ServiceRegistry.get(WordBlacklistService);

  async run() {
    const tag = this.parsedArguments.tag!;
    const unban = this.variationWasUsed("unban");

    await this.wordBlacklistService[unban ? "serverUnbanTag" : "serverBanTag"](
      this.ctx,
      tag
    );

    const embed = this.newEmbed()
      .setAuthor(this.generateEmbedAuthor(`${unban ? "Unb" : "B"}an tag`))
      .setDescription(
        `Successfully ${unban ? "un" : ""}banned the tag: ${tag.strong()}`
      )
      .setFooter({
        text: `It will ${
          unban ? "now" : "no longer"
        } appear in places where tags are listed`,
      });

    await this.send(embed);
  }
}
