import { Arguments } from "../../../../lib/arguments/arguments";
import { Delegate } from "../../../../lib/command/BaseCommand";
import {
  componentMap,
  sortConfigOptions,
} from "../../../../lib/nowplaying/componentMap";
import { Validation } from "../../../../lib/validation/ValidationChecker";
import { validators } from "../../../../lib/validation/validators";
import { Help } from "./Help";
import { NowPlayingConfigChildCommand } from "./NowPlayingConfigChildCommand";

const args = {
  inputs: {
    config: { index: { start: 0 }, join: false },
  },
} as const;

export class Set extends NowPlayingConfigChildCommand<typeof args> {
  idSeed = "weeekly jihan";

  description = "Set your nowplaying config";
  usage = ["option1 option2 optionN"];

  arguments: Arguments = args;

  delegates: Delegate<typeof args>[] = [
    {
      when: (args) => !args.config?.length,
      delegateTo: Help,
    },
  ];

  validation: Validation = {
    config: {
      validator: new validators.LengthRange({ max: 20 }),
      friendlyName: "config options",
    },
  };

  async run() {
    const newConfig = this.parseConfig(this.parsedArguments.config || []).map(
      (c) => c.toLowerCase()
    );

    const { senderUser } = await this.parseMentions({
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
      .setAuthor(...this.generateEmbedAuthor("Config set"))
      .setDescription(
        `${presetConfig ? `Using preset ${newConfig[0].code()}` : ""}
        ${filteredDisplay}
        ${filteredOutDisplay}`.trim()
      )
      .setFooter(
        filteredOut.length
          ? `See ${this.prefix}npc help for a list of all available options`
          : ""
      );

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
