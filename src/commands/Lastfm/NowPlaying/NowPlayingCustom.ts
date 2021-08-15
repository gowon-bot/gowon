import { User } from "../../../database/entity/User";
import { DatasourceService } from "../../../lib/nowplaying/DatasourceService";
import { NowPlayingBuilder } from "../../../lib/nowplaying/NowPlayingBuilder";
import { MetaService } from "../../../services/dbservices/MetaService";
import { ConfigService } from "../../../services/dbservices/NowPlayingService";
import { Requestable } from "../../../services/LastFM/LastFMAPIService";
import { NowPlayingBaseCommand } from "./NowPlayingBaseCommand";

export default class NowPlayingCustom extends NowPlayingBaseCommand {
  idSeed = "weeekly jiyoon";

  description =
    "Displays the now playing or last played track from Last.fm. See `npc help` for details on how to customize your embeds.";
  aliases = ["fmx", "npx"];

  secretCommand = true;

  datasourceService = new DatasourceService(this.logger);
  configService = new ConfigService(this.logger);
  metaService = new MetaService(this.logger);

  async run() {
    let { username, senderUser, dbUser, requestable } =
      await this.customMentions();

    const config = await this.configService.getConfigForUser(senderUser);

    const recentTracks = await this.lastFMService.recentTracks({
      username: requestable,
      limit: 1,
    });
    const nowPlaying = recentTracks.first();

    if (nowPlaying.isNowPlaying) this.scrobble(nowPlaying);

    const builder = new NowPlayingBuilder(config);

    const requirements = builder.generateRequirements();

    const resolvedRequirements =
      await this.datasourceService.resolveRequirements(requirements, {
        recentTracks,
        requestable,
        username,
        dbUser,
        message: this.message,
        components: config,
        prefix: this.prefix,
      });

    const baseEmbed = this.nowPlayingEmbed(nowPlaying, username);

    let embed = await builder.asEmbed(resolvedRequirements, baseEmbed);

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
    } = await this.parseMentions({
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
