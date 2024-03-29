import { displayNumber } from "../../lib/ui/displays";
import { ScrollingListView } from "../../lib/ui/views/ScrollingListView";
import { MetaChildCommand } from "./MetaChildCommand";

export class ServerReport extends MetaChildCommand {
  idSeed = "redsquare chaea";

  description = "Shows a list of the guilds with the most users in it";
  devCommand = true;

  async run() {
    const servers = Array.from(
      this.gowonClient.client.guilds.cache.values()
    ).sort((a, b) => b.memberCount - a.memberCount);

    const scrollingEmbed = new ScrollingListView(
      this.ctx,
      this.minimalEmbed().setTitle("Gowon guild report"),
      {
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
      }
    );

    await this.dmAuthor(scrollingEmbed);
  }
}
