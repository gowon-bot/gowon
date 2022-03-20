import { code } from "../../../../helpers/discord";
import { StringArgument } from "../../../../lib/context/arguments/argumentTypes/StringArgument";
import { StringArrayArgument } from "../../../../lib/context/arguments/argumentTypes/StringArrayArgument";
import { LineConsolidator } from "../../../../lib/LineConsolidator";
import {
  componentMap,
  getComponentsAsChoices,
} from "../../../../lib/nowplaying/componentMap";
import { NowPlayingConfigChildCommand } from "./NowPlayingConfigChildCommand";

const args = {
  options: new StringArrayArgument({
    index: { start: 0 },
    description: "The options to add to your config",
    default: [],
  }),
  option: new StringArgument({
    description: "The option to add to your config",
    required: true,
    choices: getComponentsAsChoices(),
  }),
} as const;

export class Add extends NowPlayingConfigChildCommand<typeof args> {
  idSeed = "sonamoo minjae";

  description = "Add options to your current config";
  usage = ["option", "option1 option2 ...optionN"];

  slashCommand = true;

  arguments = args;

  async run() {
    const options = this.parsedArguments.options.length
      ? this.parsedArguments.options
      : [this.parsedArguments.option];

    const newOptions = this.parseConfig(options || []).map((c) =>
      c.toLowerCase()
    );

    const { senderUser } = await this.getMentions({
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
      this.generateEmbedAuthor("Config add")
    );

    const consolidator = new LineConsolidator();

    consolidator.addLines(
      {
        string: `**Ignored**: ${ignored.map((c) => code(c)).join(", ")}`,
        shouldDisplay: !!ignored.length,
      },
      `Your new config: ${config.map((c) => code(c)).join(", ")}`
    );

    embed.setDescription(consolidator.consolidate()).setFooter({
      text: ignored.length
        ? `Nonexistant config was ignored. See ${this.prefix}npc help for a list of options`
        : "",
    });

    await this.send(embed);
  }
}
