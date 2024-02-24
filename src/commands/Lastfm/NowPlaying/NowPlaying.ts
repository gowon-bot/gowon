import { CommandRedirect } from "../../../lib/command/Command";
import { StringArgument } from "../../../lib/context/arguments/argumentTypes/StringArgument";
import { ArgumentsMap } from "../../../lib/context/arguments/types";
import { SettingsService } from "../../../lib/settings/SettingsService";
import { FMMode } from "../../../lib/settings/SettingValues";
import { CrownsService } from "../../../services/dbservices/crowns/CrownsService";
import { NowPlayingService } from "../../../services/dbservices/NowPlayingService";
import { ServiceRegistry } from "../../../services/ServicesRegistry";
import NowPlayingAlbum from "./NowPlayingAlbum";
import { nowPlayingArgs, NowPlayingBaseCommand } from "./NowPlayingBaseCommand";
import NowPlayingCombo from "./NowPlayingCombo";
import NowPlayingCompact from "./NowPlayingCompact";
import NowPlayingCustom from "./NowPlayingCustom";
import NowPlayingVerbose from "./NowPlayingVerbose";

const args = {
  type: new StringArgument({
    description: "Controls what type of embed Gowon uses",
    choices: [
      { name: FMMode.DEFAULT },
      { name: FMMode.VERBOSE },
      { name: FMMode.COMPACT },
      { name: "track", value: FMMode.VERBOSE },
      { name: FMMode.ALBUM },
      { name: FMMode.COMBO },
      { name: FMMode.CUSTOM },
    ],
    unstrictChoices: true,
  }),
  ...nowPlayingArgs,
} satisfies ArgumentsMap;

export default class NowPlaying extends NowPlayingBaseCommand<typeof args> {
  idSeed = "stayc isa";

  aliases = ["np", "fm", "mf"];
  slashCommandName = "fm";
  description =
    "Now playing | Displays the now playing or last played track from Last.fm";

  slashCommand = true;

  crownsService = ServiceRegistry.get(CrownsService);
  settingsService = ServiceRegistry.get(SettingsService);

  arguments = args;

  redirects: CommandRedirect<typeof args>[] = [
    {
      when: (args) => this.fmModeWasUsed(FMMode.VERBOSE, args.type),
      redirectTo: NowPlayingVerbose,
    },
    {
      when: (args) => this.fmModeWasUsed(FMMode.COMPACT, args.type),
      redirectTo: NowPlayingCompact,
    },
    {
      when: (args) => this.fmModeWasUsed(FMMode.ALBUM, args.type),
      redirectTo: NowPlayingAlbum,
    },
    {
      when: (args) => this.fmModeWasUsed(FMMode.COMBO, args.type),
      redirectTo: NowPlayingCombo,
    },
    {
      when: (args) => this.fmModeWasUsed(FMMode.CUSTOM, args.type),
      redirectTo: NowPlayingCustom,
    },
  ];

  getConfig(): string[] {
    return NowPlayingService.presets.default;
  }

  private fmModeWasUsed(mode: FMMode, input: string | undefined) {
    return (
      input?.toLowerCase() === mode ||
      (this.settingsService.get("defaultFMMode", {
        userID: this.author.id,
      }) === mode &&
        input?.toLowerCase() !== FMMode.DEFAULT)
    );
  }
}
