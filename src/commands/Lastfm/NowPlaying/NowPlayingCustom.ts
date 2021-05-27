import { User } from "../../../database/entity/User";
import { indexerGuilds } from "../../../lib/indexing/IndexingCommand";
import { DatasourceService } from "../../../lib/nowplaying/DatasourceService";
import { NowPlayingBuilder } from "../../../lib/nowplaying/NowPlayingBuilder";
import { ConfigService } from "../../../services/dbservices/NowPlayingService";
import { NowPlayingBaseCommand } from "./NowPlayingBaseCommand";

export default class NowPlayingCustom extends NowPlayingBaseCommand {
  idSeed = "weeekly jiyoon";

  description =
    "Displays the now playing or last played track from Last.fm. See `npc help` for details on how to customize your embeds.";
  aliases = ["fmx", "npx"];

  rollout = {
    guilds: indexerGuilds,
  };

  datasourceService = new DatasourceService(this.logger);
  configService = new ConfigService(this.logger);

  async run() {
    let { username, senderUser, dbUser } = await this.customMentions();

    const config = await this.configService.getConfigForUser(senderUser);

    const recentTracks = await this.lastFMService.recentTracks({
      username,
      limit: 1,
    });
    const nowPlaying = recentTracks.first();

    const builder = new NowPlayingBuilder(config);

    const requirements = builder.generateRequirements();

    const resolvedRequirements =
      await this.datasourceService.resolveRequirements(requirements, {
        recentTracks,
        username,
        dbUser,
        message: this.message,
      });

    const baseEmbed = this.nowPlayingEmbed(nowPlaying, username);

    const embed = await builder.asEmbed(resolvedRequirements, baseEmbed);

    const sentMessage = await this.send(embed);

    await this.customReactions(sentMessage);
    await this.easterEggs(sentMessage, nowPlaying);
  }

  private async customMentions(): Promise<{
    username: string;
    senderUser: User;
    dbUser: User;
  }> {
    const otherwords = this.parsedArguments.otherWords;
    const { senderUser, username, senderUsername, dbUser } =
      await this.parseMentions({
        reverseLookup: { lastFM: true, optional: true },
        senderRequired: true,
      });

    const usernameToUse = otherwords ? senderUsername : username;

    return {
      senderUser: senderUser!,
      username: usernameToUse,
      dbUser: (dbUser?.lastFMUsername === username ? dbUser : senderUser)!,
    };
  }
}
