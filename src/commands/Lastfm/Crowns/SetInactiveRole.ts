import { DiscordRoleArgument } from "../../../lib/context/arguments/argumentTypes/discord/DiscordRoleArgument";
import { ArgumentsMap } from "../../../lib/context/arguments/types";
import { CrownsChildCommand } from "./CrownsChildCommand";

const args = {
  inactiveRole: new DiscordRoleArgument({
    description: "The role to set as inactive",
  }),
} satisfies ArgumentsMap;

export class SetInactiveRole extends CrownsChildCommand<typeof args> {
  idSeed = "wjsn luda";

  description = "Sets the crowns inactive role for the server";
  usage = "@inactive_role";

  arguments = args;

  async run() {
    const inactiveRole = this.parsedArguments.inactiveRole;

    await this.crownsService.setInactiveRole(this.ctx, inactiveRole?.id);

    const embed = this.authorEmbed()
      .setHeader("Crowns inactive role")
      .setDescription(
        inactiveRole?.name
          ? `Set the inactive role for crowns to ${inactiveRole.name.trim()}`
          : `Cleared the inactive role`
      );

    await this.send(embed);
  }
}
