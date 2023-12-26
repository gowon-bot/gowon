import { LogicError } from "../../../../errors/errors";
import { bold, italic, sanitizeForDiscord } from "../../../../helpers/discord";
import { LastfmLinks } from "../../../../helpers/lastfm/LastfmLinks";
import { StringArgument } from "../../../../lib/context/arguments/argumentTypes/StringArgument";
import { StringArrayArgument } from "../../../../lib/context/arguments/argumentTypes/StringArrayArgument";
import { ArgumentsMap } from "../../../../lib/context/arguments/types";
import { ResolvedDependencies } from "../../../../lib/nowplaying/DatasourceService";
import { NowPlayingBuilder } from "../../../../lib/nowplaying/NowPlayingBuilder";
import { RenderedComponent } from "../../../../lib/nowplaying/base/BaseNowPlayingComponent";
import {
  componentMap,
  getComponentsAsChoices,
} from "../../../../lib/nowplaying/componentMap";
import { mockDependencies } from "../../../../lib/nowplaying/mockDependencies";
import { Image } from "../../../../lib/ui/Image";
import { displayNumber } from "../../../../lib/ui/displays";
import { NowPlayingEmbed } from "../../../../lib/ui/embeds/NowPlayingEmbed";
import { Validation } from "../../../../lib/validation/ValidationChecker";
import { validators } from "../../../../lib/validation/validators";
import {
  RecentTrack,
  RecentTracks,
} from "../../../../services/LastFM/converters/RecentTracks";
import { ServiceRegistry } from "../../../../services/ServicesRegistry";
import { NowPlayingService } from "../../../../services/dbservices/NowPlayingService";
import { AlbumCoverService } from "../../../../services/moderation/AlbumCoverService";
import {
  NowPlayingConfigChildCommand,
  preprocessConfig,
} from "./NowPlayingConfigChildCommand";

const args = {
  options: new StringArrayArgument({
    index: { start: 0 },
    default: [],
    preprocessor: preprocessConfig,
  }),
  option: new StringArgument({
    description: "The option to preview",
    required: true,
    choices: getComponentsAsChoices(),
    preprocessor: preprocessConfig,
  }),
} satisfies ArgumentsMap;

export class Preview extends NowPlayingConfigChildCommand<typeof args> {
  idSeed = "weeekly monday";

  description = "Preview a config option";
  usage = ["option1, option2... optionN", "preset"];

  arguments = args;

  slashCommand = true;

  validation: Validation = {
    options: new validators.RequiredValidator({
      message: "Please enter some options to preview, or a preset!",
    }),
  };

  albumCoverService = ServiceRegistry.get(AlbumCoverService);
  nowPlayingService = ServiceRegistry.get(NowPlayingService);

  async run() {
    const { dbUser, username } = await this.getMentions();

    const options = this.parsedArguments.options.length
      ? this.parsedArguments.options
      : [this.parsedArguments.option];

    let parsedOptions = this.parseConfig(options || []).map((c) =>
      c.toLowerCase()
    );

    const presetConfig = this.getPresetConfig(parsedOptions[0]);

    if (presetConfig) {
      parsedOptions = presetConfig;
    }

    if (
      parsedOptions.some(
        (option) => !Object.keys(componentMap).includes(option)
      )
    ) {
      throw new LogicError("Please enter a valid option!");
    }

    const nowPlayingBuilder = new NowPlayingBuilder(parsedOptions);

    const dependencies = nowPlayingBuilder.generateDependencies();

    const mockDependencies = this.resolveMockDependencies(
      dependencies,
      parsedOptions
    );
    const nowPlaying = mockDependencies.recentTracks.first() as RecentTrack;
    const links = LastfmLinks.generateTrackLinksForEmbed(nowPlaying);

    const albumCover = await this.albumCoverService.get(
      this.ctx,
      nowPlaying.images.get("large"),
      {
        metadata: { artist: nowPlaying.artist, album: nowPlaying.album },
      }
    );

    const usernameDisplay = await this.nowPlayingService.getUsernameDisplay(
      this.ctx,
      dbUser,
      username
    );

    const renderedComponents = await this.renderComponents(
      parsedOptions,
      mockDependencies
    );

    const embed = this.authorEmbed()
      .setDescription(
        `by ${bold(links.artist, false)}` +
          (nowPlaying.album ? ` from ${italic(links.album, false)}` : "")
      )
      .setTitle(sanitizeForDiscord(nowPlaying.name))
      .setURL(LastfmLinks.trackPage(nowPlaying.artist, nowPlaying.name))
      .setHeader(
        `Previewing ${
          presetConfig
            ? this.parsedArguments.options[0]
            : parsedOptions.length === 1
            ? parsedOptions[0]
            : displayNumber(parsedOptions.length, "option")
        }`
      )
      .transform(NowPlayingEmbed)
      .setDbUser(dbUser)
      .setNowPlaying((mockDependencies.recentTracks as RecentTracks).first())
      .setAlbumCover(albumCover ? Image.fromURL(albumCover) : undefined)
      .setUsername(username)
      .setUsernameDisplay(usernameDisplay)
      .setComponents(renderedComponents);

    await this.send(embed);
  }

  private resolveMockDependencies(
    dependencies: string[],
    options: string[]
  ): ResolvedDependencies {
    const object = {} as ResolvedDependencies;

    const mr = mockDependencies(this.payload);

    for (const dependency of [
      ...dependencies,
      "recentTracks",
      "username",
      "message",
      "dbUser",
      "requestable",
    ]) {
      object[dependency] = (mr as ResolvedDependencies)[dependency];
    }

    object.components = options;

    return object;
  }

  private async renderComponents(
    config: string[],
    resolvedDependencies: ResolvedDependencies
  ): Promise<RenderedComponent[]> {
    const builder = new NowPlayingBuilder(config);

    return await builder.renderComponents(resolvedDependencies);
  }
}
