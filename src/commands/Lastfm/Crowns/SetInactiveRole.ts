import { CrownsChildCommand } from "./CrownsChildCommand";
import { Message } from "discord.js";

export class SetInactiveRole extends CrownsChildCommand {
  description = "Sets the crowns inactive role for the server";
  usage = "@inactive_role";

  async run(message: Message) {
    let [inactiveRole] = message.mentions.roles.array();

    inactiveRole = inactiveRole ?? {};

    await this.crownsService.setInactiveRole(this.guild.id, inactiveRole.id);

    let embed = this.newEmbed().setDescription(
      inactiveRole.name
        ? `Set the inactive role for crowns to ${inactiveRole.name}`
        : `Cleared the inactive role`
    );

    await this.send(embed);
  }
}
