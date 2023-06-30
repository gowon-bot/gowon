import { Variation } from "../../../lib/command/Command";
import {
  DatasourceService,
  DatasourceServiceContext,
} from "../../../lib/nowplaying/DatasourceService";
import { NowPlayingBuilder } from "../../../lib/nowplaying/NowPlayingBuilder";
import { RequirementMap } from "../../../lib/nowplaying/RequirementMap";
import { ConfigService } from "../../../services/dbservices/NowPlayingService";
import { ServiceRegistry } from "../../../services/ServicesRegistry";
import { NowPlayingBaseCommand } from "./NowPlayingBaseCommand";

export default class NowPlayingCustom extends NowPlayingBaseCommand {
  idSeed = "weeekly jiyoon";

  description =
    "Now playing custom | Displays the now playing or last played track from Last.fm";
  extraDescription =
    ". See `npc help` for details on how to customize your embeds.";
  slashCommandName = "fmx";
  aliases = ["fmx", "npx"];
  variations: Variation[] = [{ name: "badTyping", variation: "fmz" }];
  slashCommand = true;

  datasourceService = ServiceRegistry.get(DatasourceService);
  configService = ServiceRegistry.get(ConfigService);

  async run() {
    const { username, senderUser, dbUser, requestable } =
      await this.getMentions({
        lfmAuthentificationRequired: true,
        senderRequired: true,
      });

    const config = await this.configService.getConfigForUser(
      this.ctx,
      senderUser!
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
          payload: this.payload,
          components: config,
          prefix: this.prefix,
        }
      );

    const baseEmbed = await this.nowPlayingEmbed(nowPlaying, username);

    const embed = await builder.asEmbed(resolvedRequirements, baseEmbed);

    if (this.variationWasUsed("badTyping")) {
      embed.setFooter({
        text:
          embed.data.footer?.text?.replaceAll(/s/gi, (match) =>
            match === "S" ? "Z" : "z"
          ) || "",
      });
    }

    const sentMessage = await this.send(embed);

    await this.customReactions(sentMessage);
    await this.easterEggs(
      sentMessage,
      nowPlaying,
      this.mutableContext<DatasourceServiceContext["mutable"]>().mutable
        .tagConsolidator
    );
  }
}
