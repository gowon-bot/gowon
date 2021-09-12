import { LogicError } from "../../../../errors";
import { sanitizeForDiscord } from "../../../../helpers/discord";
import { LinkGenerator } from "../../../../helpers/lastFM";
import { Arguments } from "../../../../lib/arguments/arguments";
import { componentMap } from "../../../../lib/nowplaying/componentMap";
import { ResolvedRequirements } from "../../../../lib/nowplaying/DatasourceService";
import { mockRequirements } from "../../../../lib/nowplaying/mockRequirements";
import { NowPlayingBuilder } from "../../../../lib/nowplaying/NowPlayingBuilder";
import { Validation } from "../../../../lib/validation/ValidationChecker";
import { validators } from "../../../../lib/validation/validators";
import { RecentTrack } from "../../../../services/LastFM/converters/RecentTracks";
import { NowPlayingConfigChildCommand } from "./NowPlayingConfigChildCommand";

const args = {
  inputs: {
    option: { index: 0 },
  },
} as const;

export class Preview extends NowPlayingConfigChildCommand<typeof args> {
  idSeed = "weeekly monday";

  description = "Preview a config option";
  usage = ["option"];

  arguments: Arguments = args;

  validation: Validation = {
    option: new validators.Required({}),
  };

  async run() {
    const option = this.parsedArguments.option!.toLowerCase();

    if (!Object.keys(componentMap).includes(option)) {
      throw new LogicError("Please enter a valid option!");
    }

    const nowPlayingBuilder = new NowPlayingBuilder([option]);

    const requirements = new (componentMap[option] as any)({
      logger: this.logger,
    }).requirements;
    const mockRequirements = this.resolveMockRequirements(requirements);
    const nowPlaying = mockRequirements.recentTracks.first() as RecentTrack;
    const links = LinkGenerator.generateTrackLinksForEmbed(nowPlaying);

    let embed = this.newEmbed()
      .setDescription(
        `by ${links.artist.strong(false)}` +
          (nowPlaying.album ? ` from ${links.album.italic(false)}` : "")
      )
      .setTitle(sanitizeForDiscord(nowPlaying.name))
      .setURL(LinkGenerator.trackPage(nowPlaying.artist, nowPlaying.name))
      .setThumbnail(nowPlaying.images.get("large") || "")
      .setAuthor(...this.generateEmbedAuthor(`Previewing ${option}`));

    embed = await nowPlayingBuilder.asEmbed(mockRequirements, embed);

    await this.send(embed);
  }

  private resolveMockRequirements(
    requirements: string[]
  ): ResolvedRequirements {
    const object = {} as ResolvedRequirements;

    const mr = mockRequirements(this.message);

    for (const requirement of [
      ...requirements,
      "recentTracks",
      "username",
      "message",
      "dbUser",
      "requestable",
    ]) {
      object[requirement] = (mr as ResolvedRequirements)[requirement];
    }

    return object;
  }
}
