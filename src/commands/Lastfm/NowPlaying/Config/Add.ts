import { Arguments } from "../../../../lib/arguments/arguments";
import { LineConsolidator } from "../../../../lib/LineConsolidator";
import { componentMap } from "../../../../lib/nowplaying/componentMap";
import { Validation } from "../../../../lib/validation/ValidationChecker";
import { validators } from "../../../../lib/validation/validators";
import { NowPlayingConfigChildCommand } from "./NowPlayingConfigChildCommand";

const args = {
  inputs: {
    options: { index: { start: 0 }, join: false },
  },
} as const;

export class Add extends NowPlayingConfigChildCommand<typeof args> {
  idSeed = "sonamoo minjae";

  description = "Add options to your current config";
  usage = ["option", "option1 option2 ...optionN"];

  arguments: Arguments = args;
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

    const config = await this.configService.getConfigNoUnused(
      this.ctx,
      senderUser!
    );

    const notIncluded = newOptions.filter(
      (c) => Object.keys(componentMap).includes(c) && !config.includes(c)
    );
    const ignored = newOptions.filter(
      (c) => !Object.keys(componentMap).includes(c)
    );

    config.push(...notIncluded);

    await this.configService.saveConfigForUser(this.ctx, senderUser!, config);

    const embed = this.newEmbed().setAuthor(
      ...this.generateEmbedAuthor("Config add")
    );

    const consolidator = new LineConsolidator();

    consolidator.addLines(
      {
        string: `**Ignored**: ${ignored.map((c) => c.code()).join(", ")}`,
        shouldDisplay: !!ignored.length,
      },
      `Your new config: ${config.map((c) => c.code()).join(", ")}`
    );

    embed
      .setDescription(consolidator.consolidate())
      .setFooter(
        ignored.length
          ? `Nonexistant config was ignored. See ${this.prefix}npc help for a list of options`
          : ""
      );

    await this.send(embed);
  }
}
