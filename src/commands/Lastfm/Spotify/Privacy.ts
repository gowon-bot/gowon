import { bullet, extraWideSpace } from "../../../helpers/specialCharacters";
import { BaseCommand } from "../../../lib/command/BaseCommand";
import { StringArgument } from "../../../lib/context/arguments/argumentTypes/StringArgument";
import { toggleValues } from "../../../lib/settings/Settings";

const args = {
  privacy: new StringArgument({
    index: 0,
    choices: ["private", "public"],
    description: "Controls whether Gowon will show identifying info",
  }),
} as const;

export default class SpotifyPrivacy extends BaseCommand<typeof args> {
  idSeed = "billlie sheon";

  subcategory = "spotify";
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
