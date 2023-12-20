import { PatronOptionsUsedWithoutBeingPatron } from "../../../../errors/commands/config";
import { code } from "../../../../helpers/discord";
import { StringArgument } from "../../../../lib/context/arguments/argumentTypes/StringArgument";
import { StringArrayArgument } from "../../../../lib/context/arguments/argumentTypes/StringArrayArgument";
import { ArgumentsMap } from "../../../../lib/context/arguments/types";
import { LineConsolidator } from "../../../../lib/LineConsolidator";
import {
  componentMap,
  getComponentByName,
  getComponentsAsChoices,
} from "../../../../lib/nowplaying/componentMap";
import {
  NowPlayingConfigChildCommand,
  preprocessConfig,
} from "./NowPlayingConfigChildCommand";

const args = {
  options: new StringArrayArgument({
    index: { start: 0 },
    description: "The options to add to your config",
    default: [],
    preprocessor: preprocessConfig,
  }),
  option: new StringArgument({
    description: "The option to add to your config",
    required: true,
    choices: getComponentsAsChoices(),
    preprocessor: preprocessConfig,
  }),
} satisfies ArgumentsMap;

export class Add extends NowPlayingConfigChildCommand<typeof args> {
  idSeed = "sonamoo minjae";

  description = "Add options to your current config";
  usage = ["option", "option1 option2 ...optionN"];

  slashCommand = true;

  arguments = args;

  async run() {
    const { senderUser } = await this.getMentions({
      senderRequired: true,
    });

    const options = this.parsedArguments.options.length
      ? this.parsedArguments.options
      : [this.parsedArguments.option];

    const newOptions = this.parseConfig(options || []).map((c) =>
      c.toLowerCase()
    );

    const config = await this.configService.getConfigNoUnused(
      this.ctx,
      senderUser!
    );

    if (!senderUser?.isPatron) {
      this.ensurePatronIfPatronOptionsPresent(newOptions, config);
    }

    const notIncluded = newOptions.filter(
      (c) => Object.keys(componentMap).includes(c) && !config.includes(c)
    );
    const ignored = newOptions.filter(
      (c) => !Object.keys(componentMap).includes(c)
    );

    config.push(...notIncluded);

    await this.configService.saveConfigForUser(this.ctx, senderUser!, config);

    const description = new LineConsolidator().addLines(
      {
        string: `**Ignored**: ${ignored.map((c) => code(c)).join(", ")}`,
        shouldDisplay: !!ignored.length,
      },
      `Your new config: ${config.map((c) => code(c)).join(", ")}`
    );

    const embed = this.authorEmbed()
      .setHeader("Nowplaying config add")
      .setDescription(description)
      .setFooter(
        ignored.length
          ? `Nonexistant config was ignored. See ${this.prefix}npc help for a list of options`
          : ""
      );

    await this.send(embed);
  }

  private ensurePatronIfPatronOptionsPresent(
    newOptions: string[],
    config: string[]
  ) {
    const patronOptions = newOptions.filter((o) => {
      const c = getComponentByName(o);

      return !!c && !!c?.patronOnly && !config.includes(c.name);
    });

    if (patronOptions.length) {
      throw new PatronOptionsUsedWithoutBeingPatron(patronOptions, this.prefix);
    }
  }
}
