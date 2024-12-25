import { code, mentionGuildMember } from "../../helpers/discord";
import { CommandAccessRoleName, roles } from "../../lib/command/access/roles";
import { Command, Variation } from "../../lib/command/Command";
import { DiscordUserArgument } from "../../lib/context/arguments/argumentTypes/discord/DiscordUserArgument";
import { StringArgument } from "../../lib/context/arguments/argumentTypes/StringArgument";
import { UserStringArgument } from "../../lib/context/arguments/argumentTypes/UserStringArgument";
import { DiscordIDMention } from "../../lib/context/arguments/mentionTypes/DiscordIDMention";
import { ArgumentsMap } from "../../lib/context/arguments/types";
import { SuccessEmbed } from "../../lib/ui/embeds/SuccessEmbed";
import { validators } from "../../lib/validation/validators";

const args = {
  role: new StringArgument({
    index: 0,
    required: true,
    choices: Object.entries(roles).map(([key, role]) => ({
      name: role.friendlyName,
      value: key,
    })),
  }),
  userID: new UserStringArgument({ mention: new DiscordIDMention() }),
  user: new DiscordUserArgument(),
} satisfies ArgumentsMap;

export default class GiveRole extends Command<typeof args> {
  idSeed = "dreamnote hanbyeol";

  subcategory = "developer";
  aliases = ["addrole"];
  description = "Gives a user a role";
  secretCommand = true;
  devCommand = true;

  variations: Variation[] = [
    {
      name: "remove",
      variation: ["removerole", "delrole"],
    },
  ];

  arguments = args;

  validation = {
    role: [
      new validators.RequiredValidator({}),
      new validators.ChoicesValidator({
        choices: Object.keys(roles),
        ignoreCase: false,
      }),
    ],
  };

  async run() {
    const role = this.parsedArguments.role;
    const { mentionedDBUser } = await this.getMentions({
      dbUserRequired: true,
    });

    const newRoles = this.variationWasUsed("remove")
      ? mentionedDBUser!.roles?.filter((r) => r !== role)
      : [...new Set(mentionedDBUser!.roles || []), role];

    await this.usersService.setRoles(
      this.ctx,
      mentionedDBUser!.discordID,
      (newRoles as CommandAccessRoleName[]) || []
    );

    const embed = new SuccessEmbed().setDescription(
      `Successfully ${
        this.variationWasUsed("remove") ? "removed" : "gave"
      } the role ${code(role)} to ${mentionGuildMember(
        mentionedDBUser!.discordID
      )}`
    );

    await this.reply(embed);
  }
}
