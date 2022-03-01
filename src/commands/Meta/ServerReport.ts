import { MetaChildCommand } from "./MetaChildCommand";
import { SimpleScrollingEmbed } from "../../lib/views/embeds/SimpleScrollingEmbed";
import { displayNumber } from "../../lib/views/displays";

export class ServerReport extends MetaChildCommand {
  idSeed = "redsquare chaea";

  description = "Shows a list of the guilds with the most users in it";
  devCommand = true;

  async run() {
    let servers = Array.from(this.gowonClient.client.guilds.cache.values());

    servers = servers.sort((a, b) => b.memberCount - a.memberCount);

    const embed = this.newEmbed().setTitle("Gowon guild report");

    const scrollingEmbed = new SimpleScrollingEmbed(this.ctx, embed, {
      pageSize: 20,
      items: servers,
      pageRenderer: (guilds) => {
        return guilds
          .map(
            (guild) =>
              `${guild.name} - ${displayNumber(guild.memberCount, "member")}`
          )
          .join("\n");
      },
    });

    scrollingEmbed.scrollingEmbed.customSend(async (embed) => {
      return await this.dmAuthor(embed);
    });
  }
}
