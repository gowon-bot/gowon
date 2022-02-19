import { StringArrayArgument } from "../../../../lib/context/arguments/argumentTypes/StringArrayArgument";
import { LineConsolidator } from "../../../../lib/LineConsolidator";
import { componentMap } from "../../../../lib/nowplaying/componentMap";
import { Validation } from "../../../../lib/validation/ValidationChecker";
import { validators } from "../../../../lib/validation/validators";
import { NowPlayingConfigChildCommand } from "./NowPlayingConfigChildCommand";

const args = {
  options: new StringArrayArgument({ index: { start: 0 } }),
} as const;

export class Remove extends NowPlayingConfigChildCommand<typeof args> {
  idSeed = "sonamoo d ana";

  description = "Remove options from your current config";
  usage = ["option", "option1 option2 ...optionN"];

  arguments = args;
  validation: Validation = {
    options: {
      validator: new validators.LengthRange({ min: 1 }),
      friendlyName: "option",
    },
  };

  async run() {
    const newOptions = this.parseConfig(this.parsedArguments.options || []).map(
      (c) => c.toLowerCase()
    );

    const { senderUser } = await this.parseMentions({
      senderRequired: true,
    });

    let config = await this.configService.getConfigNoUnused(
      this.ctx,
      senderUser!
    );

    const included = newOptions.filter(
      (c) => Object.keys(componentMap).includes(c) && config.includes(c)
    );
    const ignored = newOptions.filter(
      (c) => !Object.keys(componentMap).includes(c)
    );

    config = config.filter((c) => !included.includes(c));
    await this.configService.saveConfigForUser(this.ctx, senderUser!, config);

    const embed = this.newEmbed().setAuthor(
      this.generateEmbedAuthor("Config remove")
    );

    const consolidator = new LineConsolidator();

    consolidator.addLines(
      {
        string: `**Ignored**: ${ignored.map((c) => c.code()).join(", ")}`,
        shouldDisplay: !!ignored.length,
      },
      {
        string: `Your new config: ${config.map((c) => c.code()).join(", ")}`,
        shouldDisplay: !!config.length,
      },
      {
        string: "Empty config (your footer will be blank)",
        shouldDisplay: !config.length,
      }
    );

    embed.setDescription(consolidator.consolidate()).setFooter({
      text: ignored.length
        ? `Nonexistant config was ignored. See ${this.prefix}npc help for a list of options`
        : "",
    });

    await this.send(embed);
  }
}
