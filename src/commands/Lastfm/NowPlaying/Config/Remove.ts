import { code } from "../../../../helpers/discord";
import { StringArgument } from "../../../../lib/context/arguments/argumentTypes/StringArgument";
import { StringArrayArgument } from "../../../../lib/context/arguments/argumentTypes/StringArrayArgument";
import { ArgumentsMap } from "../../../../lib/context/arguments/types";
import { LineConsolidator } from "../../../../lib/LineConsolidator";
import {
  componentMap,
  getComponentsAsChoices,
} from "../../../../lib/nowplaying/componentMap";
import {
  NowPlayingConfigChildCommand,
  preprocessConfig,
} from "./NowPlayingConfigChildCommand";

const args = {
  options: new StringArrayArgument({
    index: { start: 0 },
    default: [],
    preprocessor: preprocessConfig,
  }),
  option: new StringArgument({
    description: "The option to remove from your config",
    required: true,
    choices: getComponentsAsChoices(),
    preprocessor: preprocessConfig,
  }),
} satisfies ArgumentsMap;

export class Remove extends NowPlayingConfigChildCommand<typeof args> {
  idSeed = "sonamoo d ana";

  description = "Remove options from your current config";
  usage = ["option", "option1 option2 ...optionN"];

  slashCommand = true;

  arguments = args;

  async run() {
    const options = this.parsedArguments.options.length
      ? this.parsedArguments.options
      : [this.parsedArguments.option];

    const newOptions = this.parseConfig(options).map((c) => c.toLowerCase());

    const { senderUser } = await this.getMentions({
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

    const description = new LineConsolidator().addLines(
      {
        string: `**Ignored**: ${ignored.map((c) => code(c)).join(", ")}`,
        shouldDisplay: !!ignored.length,
      },
      {
        string: `Your new config: ${config.map((c) => code(c)).join(", ")}`,
        shouldDisplay: !!config.length,
      },
      {
        string: "Empty config (your footer will be blank)",
        shouldDisplay: !config.length,
      }
    );

    const embed = this.minimalEmbed()
      .setDescription(description)
      .setFooter(
        ignored.length
          ? `Nonexistant config was ignored. See ${this.prefix}npc help for a list of options`
          : ""
      );

    await this.reply(embed);
  }
}
