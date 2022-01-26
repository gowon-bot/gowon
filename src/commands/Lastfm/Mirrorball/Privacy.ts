import { LinkGenerator } from "../../../helpers/lastFM";
import { BaseCommand } from "../../../lib/command/BaseCommand";
import { Emoji } from "../../../lib/Emoji";
import { validators } from "../../../lib/validation/validators";
import { displayLink } from "../../../lib/views/displays";
import { MirrorballPrivacy } from "../../../services/mirrorball/MirrorballTypes";
import { PrivateUserDisplay } from "../../../services/mirrorball/services/MirrorballUsersService";

const args = {
  inputs: {
    privacy: { index: 0 },
  },
} as const;

export default class Privacy extends BaseCommand<typeof args> {
  idSeed = "hello venus seoyoung";

  subcategory = "accounts";
  description = "Set your privacy";
  aliases = ["priv"];
  usage = ["", "<privacy>"];

  arguments = args;

  validation = {
    privacy: new validators.Choices({
      ignoreCase: true,
      choices: ["Discord", "FMUsername", "Private", "Both"],
    }),
  };

  private privacyHelp =
    "Your privacy determines what users in other servers can see about you on global leaderboards";

  async run() {
    const privacy = this.parsedArguments.privacy?.toUpperCase() as
      | MirrorballPrivacy
      | undefined;

    const { mirrorballUser, senderUsername } = await this.parseMentions({
      fetchMirrorballUser: true,
    });

    const embed = this.newEmbed()
      .setAuthor(this.generateEmbedAuthor("Privacy"))
      .setFooter({ text: this.privacyHelp });

    if (privacy) {
      await this.mirrorballUsersService.updatePrivacy(this.ctx, privacy);

      embed.setDescription(
        `Your new privacy is: \`${privacy.toLowerCase()}\` (${
          privacy === "DISCORD"
            ? this.author.tag
            : privacy === "FMUSERNAME"
            ? displayLink(
                senderUsername,
                LinkGenerator.userPage(senderUsername)
              )
            : privacy === "BOTH"
            ? displayLink(
                this.author.tag,
                LinkGenerator.userPage(senderUsername)
              )
            : PrivateUserDisplay
        })`
      );
    } else {
      embed
        .setDescription(
          `
Your current privacy: \`${(mirrorballUser?.privacy || "unset").toLowerCase()}\`
      
The options for privacy are:
- \`fmusername\`: Last.fm username is shown (${Emoji.lastfm} ${displayLink(
            senderUsername,
            LinkGenerator.userPage(senderUsername)
          )})
- \`discord\`: Discord username and discriminator are shown (${this.author.tag})
- \`both\`: Discord username and discriminator are shown, and last.fm linked (${displayLink(
            this.author.tag,
            LinkGenerator.userPage(senderUsername)
          )})
- \`private\`: Your identity will be hidden (${PrivateUserDisplay})

You can set your privacy with \`${this.prefix}privacy <option>\``
        )
        .setFooter({
          text:
            this.privacyHelp +
            (!mirrorballUser?.privacy ||
            mirrorballUser.privacy === MirrorballPrivacy.Unset
              ? "\nGowon will not reveal any information about you until you set your privacy"
              : ""),
        });
    }

    await this.send(embed);
  }
}
