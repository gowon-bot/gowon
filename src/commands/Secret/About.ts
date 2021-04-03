import { differenceInDays, fromUnixTime } from "date-fns";
import { Crown } from "../../database/entity/Crown";
import { Friend } from "../../database/entity/Friend";
import { CommandRun } from "../../database/entity/meta/CommandRun";
import { CrownEvent } from "../../database/entity/meta/CrownEvent";
import { dateDisplay, numberDisplay } from "../../helpers";
import { displayLink } from "../../helpers/discord";
import { BaseCommand } from "../../lib/command/BaseCommand";
import { CommandManager } from "../../lib/command/CommandManager";
import { CrownEventString } from "../../services/dbservices/CrownsHistoryService";
import { RedirectsService } from "../../services/dbservices/RedirectsService";
import { TagsService } from "../../services/dbservices/tags/TagsService";
import { LastFMService } from "../../services/LastFM/LastFMService";

export default class About extends BaseCommand {
  idSeed = "gfriend sinb";

  aliases = ["stats", "info"];
  description = "Shows information about the bot";
  secretCommand = true;

  startDate = new Date(2020, 6, 9);

  lastFMService = new LastFMService(this.logger);
  redirectsService = new RedirectsService(this.logger);
  tagsService = new TagsService(this.lastFMService, this.logger);
  commandManager = new CommandManager();

  async run(_: any) {
    await this.commandManager.init();

    const author = await this.gowonClient.client.users.fetch(
      Object.keys(this.gowonClient.specialUsers.developers[0])[0]
    );

    let crowns = await Crown.count();
    let yoinks = await CrownEvent.count({
      where: { event: CrownEventString.snatched },
    });
    let commandsRun = await CommandRun.count();
    let friends = await Friend.count();
    let commandCount = this.commandManager.deepList().length;

    let userInfo = await this.lastFMService.userInfo({ username: "gowon_" });
    let artistCount = await this.lastFMService.artistCount("gowon_");

    let cachedRedirects = await this.redirectsService.countAllRedirects();
    let cachedTags = await this.tagsService.countAllCachedArtists();

    let embed = this.newEmbed()
      .setAuthor(`About ${this.gowonClient.client.user?.username || "Gowon"}`)
      .setThumbnail(
        "https://raw.githubusercontent.com/jivison/gowon/master/assets/gowonswag2.png"
      )
      .setDescription(
        `${
          this.gowonClient.client.user?.username || "Gowon"
        } is ${numberDisplay(
          differenceInDays(new Date(), this.startDate),
          "day"
        ).strong()} old!
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
Commands run: ${numberDisplay(commandsRun)}
Total friends: ${numberDisplay(friends)}
Total commands: ${numberDisplay(commandCount)}`,
          inline: true,
        },
        {
          name: "Crown stats",
          value: `Total crowns: ${numberDisplay(
            crowns
          )}\nYoinks: ${numberDisplay(yoinks)}`,
          inline: true,
        },
        {
          name: "Cache stats",
          value: `Cached redirects: ${numberDisplay(
            cachedRedirects
          )}\nArtists with cached tags: ${numberDisplay(cachedTags)}`,
          inline: true,
        },
        {
          name: "Last.fm stats",
          value: `_Scrobbling since ${dateDisplay(
            fromUnixTime(userInfo.registered.unixtime.toInt())
          )}_\n\nScrobbles: ${numberDisplay(
            userInfo.playcount
          )}\nArtists scrobbled: ${numberDisplay(artistCount)}`,
        }
      )
      .setFooter(
        `Made with <3 by ${author.username}#${author.discriminator}`,
        author.avatarURL({ dynamic: true }) ?? undefined
      );

    await this.send(embed);
  }
}
