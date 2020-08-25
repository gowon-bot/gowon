import { CrownsChildCommand } from "./CrownsChildCommand";
import { Message, MessageEmbed } from "discord.js";

export class SetInactiveRole extends CrownsChildCommand {
  description = "Sets the crowns inactive role for the server";
  usage = "@inactive_role";

  async run(message: Message) {
    let [inactiveRole] = message.mentions.roles.array();

    inactiveRole = inactiveRole ?? {};

    await this.crownsService.setInactiveRole(
      message.guild?.id!,
      inactiveRole.id
    );

    let embed = new MessageEmbed().setDescription(
      `Set the inactive role for crowns to ${inactiveRole.name}`
    );

    await this.send(embed);
  }
}
