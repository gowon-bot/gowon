import { differenceInDays } from "date-fns";
import { Crown } from "../../database/entity/Crown";
import { Friend } from "../../database/entity/Friend";
import { CommandRun } from "../../database/entity/meta/CommandRun";
import { CrownEvent } from "../../database/entity/meta/CrownEvent";
import { bold } from "../../helpers/discord";
import { Command } from "../../lib/command/Command";
import {
  displayDate,
  displayLink,
  displayNumber,
  displayUserTag,
} from "../../lib/views/displays";
import { LastFMService } from "../../services/LastFM/LastFMService";
import { ServiceRegistry } from "../../services/ServicesRegistry";
import { RedirectsService } from "../../services/dbservices/RedirectsService";
import { CrownEventString } from "../../services/dbservices/crowns/CrownsHistoryService";

export default class About extends Command {
  idSeed = "gfriend sinb";

  subcategory = "about";
  aliases = ["stats", "info"];
  description = "Shows information about the bot";

  slashCommand = true;

  startDate = new Date(2020, 6, 9);

  lastFMService = ServiceRegistry.get(LastFMService);
  redirectsService = ServiceRegistry.get(RedirectsService);

  async run() {
    const author = await this.gowonClient.client.users.fetch(
      this.gowonClient.specialUsers.developers[0].id
    );

    const crowns = await Crown.count();
    const yoinks = await CrownEvent.countBy({
      event: CrownEventString.snatched,
    });
    const commandsRun = await CommandRun.count();
    const friends = await Friend.count();
    const commandCount = this.commandRegistry.deepList().length;

    const userInfo = await this.lastFMService.userInfo(this.ctx, {
      username: "gowon_",
    });
    const artistCount = await this.lastFMService.artistCount(
      this.ctx,
      "gowon_"
    );

    const cachedRedirects = await this.redirectsService.countAllRedirects(
      this.ctx
    );

    const embed = this.newEmbed()
      .setAuthor({
        name: `About ${this.gowonClient.client.user?.username || "Gowon"}`,
      })
      .setThumbnail(
        "https://raw.githubusercontent.com/jivison/gowon/master/assets/gowonswag2.png"
      )
      .setDescription(
        `${this.gowonClient.client.user?.username || "Gowon"} is ${bold(
          displayNumber(differenceInDays(new Date(), this.startDate), "day")
        )} old!
Profile pictures by ${displayLink("reis", "https://twitter.com/restlessrice")}
${displayLink("Github", "https://github.com/jivison/gowon")}, ${displayLink(
          "Last.fm",
          "https://last.fm/user/gowon_"
        )}`
      )
      .addFields(
        {
          name: "Bot stats",
          value: `Guilds cached: ${this.gowonClient.client.guilds.cache.size}
Users cached: ${this.gowonClient.client.users.cache.size}
Commands run: ${displayNumber(commandsRun)}
Total friends: ${displayNumber(friends)}
Total commands: ${displayNumber(commandCount)}`,
          inline: true,
        },
        {
          name: "Crown stats",
          value: `Total crowns: ${displayNumber(
            crowns
          )}\nYoinks: ${displayNumber(yoinks)}`,
          inline: true,
        },
        {
          name: "Cache stats",
          value: `Cached redirects: ${displayNumber(cachedRedirects)}\n`,
          inline: true,
        },
        {
          name: "Last.fm stats",
          value: `_Scrobbling since ${displayDate(
            userInfo.registeredAt
          )}_\n\nScrobbles: ${displayNumber(
            userInfo.scrobbleCount
          )}\nArtists scrobbled: ${displayNumber(artistCount)}`,
        }
      )
      .setFooter({
        text: `Made with <3 by ${displayUserTag(author)}`,
        iconURL: author.avatarURL({ dynamic: true }) ?? undefined,
      });

    await this.send(embed);
  }
}
