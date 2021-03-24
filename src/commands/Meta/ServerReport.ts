import { MetaChildCommand } from "./MetaChildCommand";
import { Arguments } from "../../lib/arguments/arguments";
import { SimpleScrollingEmbed } from "../../helpers/Embeds/SimpleScrollingEmbed";
import { numberDisplay } from "../../helpers";

const args = {} as const;

export class ServerReport extends MetaChildCommand<typeof args> {
  idSeed = "redsquare chaea";

  description = "Shows a list of the guilds with the most users in it";
  devCommand = true;

  arguments: Arguments = args;

  async run() {
    let servers = this.gowonClient.client.guilds.cache.array();

    servers = servers.sort((a, b) => b.memberCount - a.memberCount);

    const embed = this.newEmbed().setTitle("Gowon guild report");

    const scrollingEmbed = new SimpleScrollingEmbed(this.message, embed, {
      pageSize: 20,
      items: servers,
      pageRenderer: (guilds) => {
        return guilds
          .map(
            (guild) =>
              `${guild.name} - ${numberDisplay(guild.memberCount, "member")}`
          )
          .join("\n");
      },
    });

    scrollingEmbed.scrollingEmbed.customSend(async (embed) => {
      return await this.author.send(embed);
    });
  }
}
