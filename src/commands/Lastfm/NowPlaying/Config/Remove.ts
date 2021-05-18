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

export class Remove extends NowPlayingConfigChildCommand<typeof args> {
  idSeed = "sonamoo d ana";

  description = "Remove an option from your current config";
  usage = ["option"];

  arguments: Arguments = args;
  validation: Validation = {
    option: new validators.Required({}),
  };

  async run() {
    const filterOption = this.parsedArguments.option!.toLowerCase();

    const { senderUser } = await this.parseMentions({
      senderRequired: true,
    });

    let config = await this.configService.getConfigForUser(senderUser!);

    if (!Object.keys(componentMap).includes(filterOption)) {
      throw new LogicError(this.notAnOptionError(filterOption));
    } else if (!config.includes(filterOption)) {
      throw new LogicError(
        `${filterOption.code()} is already not in your config!\n\nYour config: ${config
          .map((c) => c.code())
          .join(", ")}`
      );
    }

    config = config.filter((c) => c !== filterOption);
    await this.configService.saveConfigForUser(senderUser!, config);

    const embed = this.newEmbed().setAuthor(
      ...this.generateEmbedAuthor("Config remove")
    );

    embed.setDescription(
      config.length
        ? config.map((c) => c.code()).join(", ")
        : "Empty config (your footer will be blank)"
    );

    await this.send(embed);
  }
}
