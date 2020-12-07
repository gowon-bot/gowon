import { differenceInDays, fromUnixTime } from "date-fns";
import { Crown } from "../../database/entity/Crown";
import { Friend } from "../../database/entity/Friend";
import { CommandRun } from "../../database/entity/meta/CommandRun";
import { CrownEvent } from "../../database/entity/meta/CrownEvent";
import { dateDisplay, numberDisplay } from "../../helpers";
import { generateLink } from "../../helpers/discord";
import { BaseCommand } from "../../lib/command/BaseCommand";
import { CrownEventString } from "../../services/dbservices/CrownsHistoryService";
import { RedirectsService } from "../../services/dbservices/RedirectsService";
import { TagsService } from "../../services/dbservices/TagsService";
import { LastFMService } from "../../services/LastFM/LastFMService";

export default class About extends BaseCommand {
  idSeed = "gfriend sinb";
  
  aliases = ["stats"];
  description = "Shows information about the bot";
  secretCommand = true;

  startDate = new Date(2020, 6, 9);

  lastFMService = new LastFMService(this.logger);
  redirectsService = new RedirectsService(this.logger);
  tagsService = new TagsService(this.logger);

  async run(_: any) {
    let crowns = await Crown.count();
    let yoinks = await CrownEvent.count({
      where: { event: CrownEventString.snatched },
    });
    let commandsRun = await CommandRun.count();
    let friends = await Friend.count();

    let userInfo = await this.lastFMService.userInfo({ username: "gowon_" });
    let artistCount = await this.lastFMService.artistCount("gowon_");

    let cachedRedirects = await this.redirectsService.countAllRedirects();
    let cachedTags = await this.tagsService.countAllCachedArtists();

    let embed = this.newEmbed()
      .setAuthor(`About ${this.gowonClient.client.user?.username || "Gowon"}`)
      .setThumbnail("https://pbs.twimg.com/media/Dx0gzYBWkAAH6Dv.jpg:large")
      .setDescription(
        `${
          this.gowonClient.client.user?.username || "Gowon"
        } is ${numberDisplay(
          differenceInDays(new Date(), this.startDate),
          "day"
        ).strong()} old!\n${generateLink(
          "Github",
          "https://github.com/jivison/gowon"
        )}`
      )
      .addFields(
        {
          name: "Bot stats",
          value: `Commands run: ${numberDisplay(
            commandsRun
          )}\nTotal friends: ${numberDisplay(friends)}`,
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
        "Made with <3 by John🥳#2527",
        (
          await this.gowonClient.client.users.fetch("267794154459889664")
        ).avatarURL({ dynamic: true }) ?? undefined
      );

    await this.send(embed);
  }
}
