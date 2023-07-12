import { bullet, extraWideSpace } from "../../helpers/specialCharacters";
import { StringArgument } from "../../lib/context/arguments/argumentTypes/StringArgument";
import { ArgumentsMap } from "../../lib/context/arguments/types";
import { toggleValues } from "../../lib/settings/SettingValues";
import { SpotifyChildCommand } from "./SpotifyChildCommand";

const args = {
  privacy: new StringArgument({
    index: 0,
    choices: ["private", "public"],
    description: "Controls whether Gowon will show identifying info",
  }),
} satisfies ArgumentsMap;

export class Privacy extends SpotifyChildCommand<typeof args> {
  idSeed = "billlie sheon";

  description = "Control what Spotify information Gowon shows";
  aliases = ["sprivacy", "spriv"];
  usage = ["public", "private"];

  arguments = args;

  privacyHelp = `Your Spotify privacy controls what information Gowon will display:
${extraWideSpace}${bullet} \`private\` means Gowon will not show information that may lead to your Spotify profile (for example playlist names).
${extraWideSpace}${bullet} \`public\` means Gowon will show this information.`;

  async run() {
    const privacy = this.parsedArguments.privacy;

    if (!privacy) {
      const currentPrivacy = this.settingsService.get("spotifyPrivateMode", {
        userID: this.author.id,
      });

      const embed = this.newEmbed()
        .setTitle("Spotify privacy")
        .setDescription(
          `Your current spotify privacy is: \`${
            currentPrivacy === toggleValues.ON ? "private" : "public"
          }\`\n\n${this.privacyHelp}`
        );

      await this.send(embed);
    } else {
      await this.settingsService.set(
        this.ctx,
        "spotifyPrivateMode",
        { userID: this.author.id },
        privacy === "public" ? toggleValues.OFF : toggleValues.ON
      );

      const embed = this.newEmbed()
        .setTitle("Spotify privacy")
        .setDescription(
          `Your new Spotify privacy is: \`${privacy}\`\n\n${this.privacyHelp}`
        );

      await this.send(embed);
    }
  }
}
