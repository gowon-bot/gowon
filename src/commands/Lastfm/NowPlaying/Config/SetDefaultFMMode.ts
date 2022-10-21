import { code } from "../../../../helpers/discord";
import { StringArgument } from "../../../../lib/context/arguments/argumentTypes/StringArgument";
import { FMMode } from "../../../../lib/settings/SettingValues";
import { NowPlayingConfigChildCommand } from "./NowPlayingConfigChildCommand";

const args = {
  mode: new StringArgument({
    description: "The option to add to your config",
    choices: [
      FMMode.DEFAULT,
      FMMode.VERBOSE,
      FMMode.CUSTOM,
      FMMode.COMPACT,
      FMMode.ALBUM,
      FMMode.COMBO,
    ],
    preprocessor: (s) => s.toLowerCase(),
  }),
} as const;

export class SetFMMode extends NowPlayingConfigChildCommand<typeof args> {
  idSeed = "brave girls eunji";

  description = 'Set which type of embed Gowon uses when you "!fm" or "!np"';
  usage = ["mode"];

  aliases = ["fmmode", "mode"];

  slashCommand = true;

  arguments = args;

  async run() {
    const mode = this.parsedArguments.mode;

    if (!mode) {
      const currentMode = this.settingsService.get("defaultFMMode", {
        userID: this.author.id,
      });

      const embed = this.newEmbed()
        .setTitle(`${this.prefix}fm mode`)
        .setDescription(
          `Your current ${this.prefix}fm mode is: ${code(
            currentMode || FMMode.DEFAULT
          )}\n\nUse \`${this.prefix}fmmode <mode>\` to set a new one`
        );

      await this.send(embed);
    } else {
      await this.settingsService.set(
        this.ctx,
        "defaultFMMode",
        { userID: this.author.id },
        mode === FMMode.DEFAULT ? undefined : mode
      );

      const embed = this.newEmbed()
        .setTitle(`${this.prefix}fm mode`)
        .setDescription(`Your new ${this.prefix}fm mode is: \`${mode}\``);

      await this.send(embed);
    }
  }
}
