import { CrownsChildCommand } from "./CrownsChildCommand";
import { Message, MessageEmbed } from "discord.js";

export class SetPurgatoryRole extends CrownsChildCommand {
  description = "Sets the crowns purgatory role for the server";
  usage = "@purgatory_role";

  async run(message: Message) {
    let [purgatoryRole] = message.mentions.roles.array();

    purgatoryRole = purgatoryRole ?? {};

    await this.crownsService.setPurgatoryRole(
      message.guild?.id!,
      purgatoryRole.id
    );

    let embed = new MessageEmbed().setDescription(
      purgatoryRole.name
        ? `Set the purgatory role for crowns to ${purgatoryRole.name}`
        : `Cleared the purgatory role`
    );

    await this.send(embed);
  }
}
