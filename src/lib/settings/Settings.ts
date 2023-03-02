import { defaultPrefix } from "../../../config.json";
import { ComboService } from "../../services/dbservices/ComboService";
import {
  BaseSetting,
  BotScopedSetting,
  GuildMemberScopedSetting,
  GuildScopedSetting,
  SettingType,
  UserScopedSetting,
} from "./SettingTypes";
import { FMMode, toggleValues } from "./SettingValues";

export const Settings = {
  // Guild scoped
  adminRole: new GuildScopedSetting("admin_role", {
    friendlyName: "Admin role",
    description:
      "What role is allowed to run admin commands. (all 'Administator' users can run them by default)",
    type: SettingType.Role,
  }),
  prefix: new GuildScopedSetting("prefix", {
    friendlyName: "Prefix",
    description: `What prefix the bot uses (defaults to ${defaultPrefix})`,
    type: SettingType.TextShort,
  }),
  inactiveRole: new GuildScopedSetting("inactive_role", {
    category: "Crowns",
    friendlyName: "Inactive role",
    description: "What role Gowon counts as inactive in the crowns game",
    type: SettingType.Role,
  }),
  purgatoryRole: new GuildScopedSetting("purgatory_role", {
    category: "Crowns",
    friendlyName: "Purgatory role",
    description:
      "What role Gowon counts as 'in purgatory' (ie. cheating scrobbles) in the crowns game",
    type: SettingType.Role,
  }),
  strictTagBans: new GuildScopedSetting("strict_tag_bans", {
    friendlyName: "Strict tag bans",
    description: "Prevents users from inputting banned tags to commands",
    type: SettingType.Toggle,
  }),

  // Guild member scoped
  optedOut: new GuildMemberScopedSetting("opted_out", {
    omitFromDashboard: true,
  }),

  // User scoped
  reacts: new UserScopedSetting("reacts", {
    omitFromDashboard: true,
  }),
  defaultSpotifyPlaylist: new UserScopedSetting("default_spotify_playlist", {
    omitFromDashboard: true,
    category: "Spotify",
  }),
  spotifyPrivateMode: new UserScopedSetting("spotify_private_mode", {
    friendlyName: "Private mode",
    category: "Spotify",
    description: "Doesn't show info that could reveal your Spotify account",
    default: toggleValues.ON,
    type: SettingType.Toggle,
  }),
  defaultFMMode: new UserScopedSetting("default_fm_mode", {
    friendlyName: "Default !fm mode",
    category: "Configuration",
    description: "Control which type of embed Gowon uses when you !fm",
    type: SettingType.Choice,
    default: FMMode.DEFAULT,
    choices: [
      FMMode.ALBUM,
      FMMode.COMBO,
      FMMode.COMPACT,
      FMMode.CUSTOM,
      FMMode.DEFAULT,
      FMMode.VERBOSE,
    ],
  }),
  timezone: new UserScopedSetting("timezone", {
    friendlyName: "Timezone",
    description: "Control what timezone Gowon uses",
    omitFromDashboard: true,
    category: "Configuration",
    type: SettingType.Choice,
  }),
  comboSaveThreshold: new UserScopedSetting("combo_save_threshold", {
    friendlyName: "Combo save threshold",
    description: "Control when Gowon saves your combos",
    category: "Configuration",
    type: SettingType.Number,
    default: `${ComboService.defaultComboThreshold}`,
  }),

  // Bot scoped
  issueMode: new BotScopedSetting("issue_mode", {
    omitFromDashboard: true,
  }),
} satisfies Record<string, BaseSetting<unknown>>;

export type SettingsMap = {
  [K in keyof typeof Settings]: (typeof Settings)[K];
};
