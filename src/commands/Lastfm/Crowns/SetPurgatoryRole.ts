import { CrownsChildCommand } from "./CrownsChildCommand";
import { Message } from "discord.js";

export class SetPurgatoryRole extends CrownsChildCommand {
  idSeed = "wjsn dawon";

  description = "Sets the crowns purgatory role for the server";
  usage = "@purgatory_role";

  async run(message: Message) {
    let [purgatoryRole] = message.mentions.roles.values();

    purgatoryRole = purgatoryRole ?? {};

    await this.crownsService.setPurgatoryRole(this.guild.id, purgatoryRole.id);

    const embed = this.newEmbed().setDescription(
      purgatoryRole.name
        ? `Set the purgatory role for crowns to ${purgatoryRole.name}`
        : `Cleared the purgatory role`
    );

    await this.send(embed);
  }
}
