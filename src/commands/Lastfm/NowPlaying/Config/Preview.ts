import { LogicError } from "../../../../errors";
import { sanitizeForDiscord } from "../../../../helpers/discord";
import { LinkGenerator } from "../../../../helpers/lastFM";
import { StringArgument } from "../../../../lib/context/arguments/argumentTypes/StringArgument";
import { StringArrayArgument } from "../../../../lib/context/arguments/argumentTypes/StringArrayArgument";
import {
  componentMap,
  getComponentsAsChoices,
} from "../../../../lib/nowplaying/componentMap";
import { ResolvedRequirements } from "../../../../lib/nowplaying/DatasourceService";
import { mockRequirements } from "../../../../lib/nowplaying/mockRequirements";
import { NowPlayingBuilder } from "../../../../lib/nowplaying/NowPlayingBuilder";
import { Validation } from "../../../../lib/validation/ValidationChecker";
import { validators } from "../../../../lib/validation/validators";
import { displayNumber } from "../../../../lib/views/displays";
import { RecentTrack } from "../../../../services/LastFM/converters/RecentTracks";
import { NowPlayingConfigChildCommand } from "./NowPlayingConfigChildCommand";

const args = {
  options: new StringArrayArgument({ index: { start: 0 }, default: [] }),
  option: new StringArgument({
    description: "The option to preview",
    required: true,
    choices: getComponentsAsChoices(),
  }),
} as const;

export class Preview extends NowPlayingConfigChildCommand<typeof args> {
  idSeed = "weeekly monday";

  description = "Preview a config option";
  usage = ["option1, option2... optionN", "preset"];

  arguments = args;

  slashCommand = true;

  validation: Validation = {
    options: new validators.Required({
      message: "Please enter some options to preview, or a preset!",
    }),
  };

  async run() {
    const options = this.parsedArguments.options.length
      ? this.parsedArguments.options
      : [this.parsedArguments.option];

    let parsedOptions = this.parseConfig(options || []).map((c) =>
      c.toLowerCase()
    );

    const presetConfig = (this.presets as any)[parsedOptions[0]];

    if (presetConfig) {
      parsedOptions = (this.presets as any)[parsedOptions[0]];
    }

    if (
      parsedOptions.some(
        (option) => !Object.keys(componentMap).includes(option)
      )
    ) {
      throw new LogicError("Please enter a valid option!");
    }

    const nowPlayingBuilder = new NowPlayingBuilder(parsedOptions);

    const requirements = nowPlayingBuilder.generateRequirements();

    const mockRequirements = this.resolveMockRequirements(
      requirements,
      parsedOptions
    );
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
      .setAuthor(
        this.generateEmbedAuthor(
          `Previewing ${
            presetConfig
              ? this.parsedArguments.options[0]
              : parsedOptions.length === 1
              ? parsedOptions[0]
              : displayNumber(parsedOptions.length, "option")
          }`
        )
      );

    embed = await nowPlayingBuilder.asEmbed(mockRequirements, embed);

    await this.send(embed);
  }

  private resolveMockRequirements(
    requirements: string[],
    options: string[]
  ): ResolvedRequirements {
    const object = {} as ResolvedRequirements;

    const mr = mockRequirements(this.payload);

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

    object.components = options;

    return object;
  }
}
