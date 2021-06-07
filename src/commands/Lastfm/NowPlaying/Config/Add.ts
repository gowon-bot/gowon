import { LogicError } from "../../../../errors";
import { Arguments } from "../../../../lib/arguments/arguments";
import { componentMap } from "../../../../lib/nowplaying/componentMap";
import { Validation } from "../../../../lib/validation/ValidationChecker";
import { validators } from "../../../../lib/validation/validators";
import { NowPlayingConfigChildCommand } from "./NowPlayingConfigChildCommand";

const args = {
  inputs: {
    option: { index: 0 },
  },
} as const;

export class Add extends NowPlayingConfigChildCommand<typeof args> {
  idSeed = "sonamoo minjae";

  description = "Add an option to your current config";
  usage = ["option"];

  arguments: Arguments = args;
  validation: Validation = {
    option: new validators.Required({}),
  };

  async run() {
    const newOption = this.parsedArguments.option!.toLowerCase();

    const { senderUser } = await this.parseMentions({
      senderRequired: true,
    });

    const config = await this.configService.getConfigForUser(senderUser!);

    if (config.includes(newOption)) {
      throw new LogicError(
        `${newOption.code()} is already in your config!\n\nYour config: ${config
          .map((c) => c.code())
          .join(", ")}`
      );
    } else if (!Object.keys(componentMap).includes(newOption)) {
      throw new LogicError(this.notAnOptionError(newOption));
    }

    config.push(newOption);
    await this.configService.saveConfigForUser(senderUser!, config);

    const embed = this.newEmbed().setAuthor(
      ...this.generateEmbedAuthor("Config add")
    );

    embed.setDescription(config.map((c) => c.code()).join(", "));

    await this.send(embed);
  }
}
