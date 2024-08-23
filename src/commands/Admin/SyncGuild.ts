import { displayNumber } from "../../lib/ui/displays";
import { SuccessEmbed } from "../../lib/ui/embeds/SuccessEmbed";
import { AdminBaseCommand } from "./AdminBaseCommand";

export default class SyncGuild extends AdminBaseCommand {
  idSeed = "billlie moon sua";

  description = "Syncs the list of server members with Gowon";
  aliases = ["serversync", "syncserver", "syncservermembers"];
  usage = "";

  adminCommand = true;
  slashCommand = true;
  guildRequired = true;

  async run() {
    const members = await this.requiredGuild.members.fetch();

    const discordIDs = members.map((m) => m.id);
    const guildID = this.requiredGuild.id;

    await this.lilacGuildsService.sync(this.ctx, guildID, discordIDs);

    const embed = new SuccessEmbed().setDescription(
      `Successfully synced ${displayNumber(
        discordIDs.length,
        "member"
      )} with Lilac`
    );

    await this.reply(embed);
  }
}
