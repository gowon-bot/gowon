import { LastfmLinks } from "../../../helpers/lastfm/LastfmLinks";
import { Command } from "../../../lib/command/Command";
import { StringArgument } from "../../../lib/context/arguments/argumentTypes/StringArgument";
import { ArgumentsMap } from "../../../lib/context/arguments/types";
import { Emoji } from "../../../lib/emoji/Emoji";
import { displayLink, displayUserTag } from "../../../lib/views/displays";
import { LilacPrivacy } from "../../../services/lilac/LilacAPIService.types";
import { PrivateUserDisplay } from "../../../services/lilac/LilacUsersService";

const args = {
  privacy: new StringArgument({
    index: 0,
    choices: [
      { value: "Private", name: "Nothing" },
      { value: "FMUsername", name: "Last.fm username" },
      { value: "Discord", name: "Discord tag" },
      { value: "Both", name: "Last.fm username and Discord tag" },
    ],
    description: "What other users can see about you on global leaderboards",
  }),
} satisfies ArgumentsMap;

export default class Privacy extends Command<typeof args> {
  idSeed = "hello venus seoyoung";

  subcategory = "accounts";
  description =
    "Control what other users can see about you on global leaderboards";
  aliases = ["priv"];
  usage = ["", "<privacy>"];

  arguments = args;

  slashCommand = true;

  private privacyHelp =
    "Your privacy determines what users in other servers can see about you on global leaderboards";

  async run() {
    const privacy = this.parsedArguments.privacy?.toLowerCase() as
      | LilacPrivacy
      | undefined;

    const { lilacUser, senderUsername } = await this.getMentions({
      fetchLilacUser: true,
    });

    const embed = this.authorEmbed()
      .setHeader("Privacy")
      .setFooter(this.privacyHelp);

    if (privacy) {
      await this.lilacUsersService.modify(
        this.ctx,
        { discordID: this.author.id },
        { privacy: privacy.toUpperCase() as LilacPrivacy }
      );

      embed.setDescription(
        `Your new privacy is: \`${privacy.toLowerCase()}\` (${
          privacy === LilacPrivacy.Discord
            ? displayUserTag(this.author)
            : privacy === LilacPrivacy.FMUsername
            ? displayLink(senderUsername, LastfmLinks.userPage(senderUsername))
            : privacy === LilacPrivacy.Both
            ? displayLink(
                displayUserTag(this.author),
                LastfmLinks.userPage(senderUsername)
              )
            : PrivateUserDisplay
        })`
      );
    } else {
      embed
        .setDescription(
          `
Your current privacy: \`${lilacUser?.privacy?.toLowerCase() || "unset"}\`
      
The options for privacy are:
- \`fmusername\`: Last.fm username is shown (${Emoji.lastfm} ${displayLink(
            senderUsername,
            LastfmLinks.userPage(senderUsername)
          )})
- \`discord\`: Discord username is shown (${displayUserTag(this.author)})
- \`both\`: Discord username is shown, and last.fm linked (${displayLink(
            displayUserTag(this.author),
            LastfmLinks.userPage(senderUsername)
          )})
- \`private\`: Your identity will be hidden (${PrivateUserDisplay})

You can set your privacy with \`${this.prefix}privacy <option>\``
        )
        .setFooter(
          this.privacyHelp +
            (!lilacUser?.privacy || lilacUser.privacy === LilacPrivacy.Unset
              ? "\nGowon will not reveal any information about you until you set your privacy"
              : "")
        );
    }

    await this.send(embed);
  }
}
