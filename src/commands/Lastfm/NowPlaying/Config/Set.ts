import { code } from "../../../../helpers/discord";
import { CommandRedirect } from "../../../../lib/command/Command";
import { StringArrayArgument } from "../../../../lib/context/arguments/argumentTypes/StringArrayArgument";
import { ArgumentsMap } from "../../../../lib/context/arguments/types";
import {
  componentMap,
  sortConfigOptions,
} from "../../../../lib/nowplaying/componentMap";
import { Validation } from "../../../../lib/validation/ValidationChecker";
import { validators } from "../../../../lib/validation/validators";
import { Help } from "./Help";
import {
  NowPlayingConfigChildCommand,
  preprocessConfig,
} from "./NowPlayingConfigChildCommand";

const args = {
  config: new StringArrayArgument({
    index: { start: 0 },
    preprocessor: preprocessConfig,
  }),
} satisfies ArgumentsMap;

export class Set extends NowPlayingConfigChildCommand<typeof args> {
  idSeed = "weeekly jihan";

  description = "Set your nowplaying config";
  usage = ["option1 option2 optionN"];

  arguments = args;

  redirects: CommandRedirect<typeof args>[] = [
    {
      when: (args) => !args.config?.length,
      redirectTo: Help,
    },
  ];

  validation: Validation = {
    config: {
      validator: new validators.LengthRangeValidator({ max: 20 }),
      friendlyName: "config options",
    },
  };

  async run() {
    const newConfig = this.parseConfig(this.parsedArguments.config || []).map(
      (c) => c.toLowerCase()
    );

    const { senderUser } = await this.getMentions({
      senderRequired: true,
    });

    const presetConfig = (this.presets as any)[newConfig[0]];

    let filtered = [] as string[],
      filteredOut = [] as string[];

    if (presetConfig) {
      filtered = presetConfig;
      await this.configService.saveConfigForUser(
        this.ctx,
        senderUser!,
        filtered
      );
    } else {
      const filteredOptions = this.filterBadOptions(newConfig);
      filtered = filteredOptions.filtered;
      filteredOut = filteredOptions.filteredOut;

      if (filtered.length) {
        await this.configService.saveConfigForUser(
          this.ctx,
          senderUser!,
          filtered
        );
      }
    }

    const filteredDisplay = filtered.length
      ? `\`\`\`diff
${filtered.map((f) => `+ ${f}`).join("\n")}\`\`\``
      : "";
    const filteredOutDisplay = filteredOut.length
      ? `Ignored\n\`\`\`diff
${filteredOut.map((f) => `- ${f}`).join("\n")}\`\`\``
      : "";

    const embed = this.newEmbed()
      .setAuthor(this.generateEmbedAuthor("Config set"))
      .setDescription(
        `${presetConfig ? `Using preset ${code(newConfig[0])}` : ""}
        ${filteredDisplay}
        ${filteredOutDisplay}`.trim()
      )
      .setFooter({
        text: filteredOut.length
          ? `See ${this.prefix}npc help for a list of all available options`
          : "",
      });

    await this.send(embed);
  }

  private filterBadOptions(options: string[]): {
    filteredOut: string[];
    filtered: string[];
  } {
    const availableOptions = Object.keys(componentMap);

    const filteredOut = [] as string[];
    const filtered = [] as string[];

    for (const option of options) {
      if (availableOptions.includes(option)) {
        filtered.push(option);
      } else {
        filteredOut.push(option);
      }
    }

    return { filtered: sortConfigOptions(filtered), filteredOut };
  }
}
