import { CrownsChildCommand } from "./CrownsChildCommand";
import { DiscordRoleArgument } from "../../../lib/context/arguments/argumentTypes/discord/DiscordRoleArgument";

const args = {
  purgatoryRole: new DiscordRoleArgument(),
} as const;

export class SetPurgatoryRole extends CrownsChildCommand<typeof args> {
  idSeed = "wjsn dawon";

  description = "Sets the crowns purgatory role for the server";
  usage = "@purgatory_role";

  arguments = args;

  async run() {
    const purgatoryRole = this.parsedArguments.purgatoryRole;

    await this.crownsService.setPurgatoryRole(this.ctx, purgatoryRole?.id);

    const embed = this.newEmbed()
      .setAuthor(this.generateEmbedAuthor("Purgatory role"))
      .setDescription(
        purgatoryRole?.name
          ? `Set the purgatory role for crowns to ${purgatoryRole.name.trim()}`
          : `Cleared the purgatory role`
      );

    await this.send(embed);
  }
}
