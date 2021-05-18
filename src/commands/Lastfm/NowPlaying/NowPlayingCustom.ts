import { User } from "../../../database/entity/User";
import { DatasourceService } from "../../../lib/nowplaying/DatasourceService";
import { NowPlayingBuilder } from "../../../lib/nowplaying/NowPlayingBuilder";
import { ConfigService } from "../../../services/dbservices/NowPlayingService";
import { NowPlayingBaseCommand } from "./NowPlayingBaseCommand";

export default class NowPlayingCustom extends NowPlayingBaseCommand {
  idSeed = "weeekly jiyoon";

  description =
    "Displays the now playing or last played track from Last.fm. See `npc help` for details on how to customize your embeds.";
  secretCommand = true;
  aliases = ["fmx", "npx"];

  datasourceService = new DatasourceService(this.logger);
  configService = new ConfigService(this.logger);

  async run() {
    let { username, senderUser, dbUser } = await this.customMentions();

    const config = await this.configService.getConfigForUser(senderUser);

    const recentTracks = await this.lastFMService.recentTracksRaw({
      username,
      limit: 1,
    });
    const nowPlaying = recentTracks.recenttracks.track[0];

    const builder = new NowPlayingBuilder(config);

    const requirements = builder.generateRequirements();

    const resolvedRequirements = await this.datasourceService.resolveRequirements(
      requirements,
      { recentTracks, username, dbUser, message: this.message }
    );

    const baseEmbed = this.nowPlayingEmbed(nowPlaying, username);

    const embed = await builder.asEmbed(resolvedRequirements, baseEmbed);

    await this.send(embed);
  }

  private async customMentions(): Promise<{
    username: string;
    senderUser: User;
    dbUser: User;
  }> {
    const otherwords = this.parsedArguments.otherWords;
    const {
      senderUser,
      username,
      senderUsername,
      dbUser,
    } = await this.parseMentions({
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
