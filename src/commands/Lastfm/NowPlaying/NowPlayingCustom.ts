import { User } from "../../../database/entity/User";
import { Variation } from "../../../lib/command/BaseCommand";
import { DatasourceService } from "../../../lib/nowplaying/DatasourceService";
import { NowPlayingBuilder } from "../../../lib/nowplaying/NowPlayingBuilder";
import { RequirementMap } from "../../../lib/nowplaying/RequirementMap";
import { ConfigService } from "../../../services/dbservices/NowPlayingService";
import { Requestable } from "../../../services/LastFM/LastFMAPIService";
import { ServiceRegistry } from "../../../services/ServicesRegistry";
import { NowPlayingBaseCommand } from "./NowPlayingBaseCommand";

export default class NowPlayingCustom extends NowPlayingBaseCommand {
  idSeed = "weeekly jiyoon";

  description =
    "Displays the now playing or last played track from Last.fm. See `npc help` for details on how to customize your embeds.";
  aliases = ["fmx", "npx"];
  variations: Variation[] = [{ name: "badTyping", variation: "fmz" }];

  datasourceService = ServiceRegistry.get(DatasourceService);
  configService = ServiceRegistry.get(ConfigService);

  async run() {
    let { username, senderUser, dbUser, requestable } =
      await this.customMentions();

    const config = await this.configService.getConfigForUser(
      this.ctx,
      senderUser
    );

    const recentTracks = await this.lastFMService.recentTracks(this.ctx, {
      username: requestable,
      limit: 1,
    });
    const nowPlaying = recentTracks.first();

    if (nowPlaying.isNowPlaying) this.scrobble(nowPlaying);

    const builder = new NowPlayingBuilder(config);

    const requirements = builder.generateRequirements();

    const resolvedRequirements =
      await this.datasourceService.resolveRequirements(
        this.ctx,
        requirements as (keyof RequirementMap)[],
        {
          recentTracks,
          requestable,
          username,
          dbUser,
          message: this.message,
          components: config,
          prefix: this.prefix,
        }
      );

    const baseEmbed = this.nowPlayingEmbed(nowPlaying, username);

    const embed = await builder.asEmbed(resolvedRequirements, baseEmbed);

    if (this.variationWasUsed("badTyping")) {
      embed.setFooter({
        text: embed.footer?.text?.replaceAll(/scrobbles/gi, "scrobblez") || "",
      });
    }

    const sentMessage = await this.send(embed);

    await this.customReactions(sentMessage);
    await this.easterEggs(sentMessage, nowPlaying);
  }

  private async customMentions(): Promise<{
    username: string;
    senderUser: User;
    dbUser: User;
    requestable: Requestable;
  }> {
    const otherwords = this.parsedArguments.otherWords;
    const {
      senderUser,
      username,
      senderUsername,
      mentionedDBUser,
      requestable,
      senderRequestable,
    } = await this.getMentions({
      authentificationRequired: true,
      senderRequired: true,
    });

    const usernameToUse = otherwords ? senderUsername : username;
    const requestableToUse = otherwords ? senderRequestable : requestable;

    return {
      requestable: requestableToUse,
      senderUser: senderUser!,
      username: usernameToUse,
      dbUser: (mentionedDBUser?.lastFMUsername === username
        ? mentionedDBUser
        : senderUser)!,
    };
  }
}
