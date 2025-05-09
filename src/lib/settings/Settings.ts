import { defaultPrefix } from "../../../config.json";
import { ComboService } from "../../services/dbservices/ComboService";
import { Emoji } from "../emoji/Emoji";
import {
  BaseSetting,
  BotScopedSetting,
  GuildMemberScopedSetting,
  GuildScopedSetting,
  SettingType,
  UserScopedSetting,
} from "./SettingTypes";
import { FMMode, FMUsernameDisplay, toggleValues } from "./SettingValues";

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
  defaultFMMode: new UserScopedSetting("default_fm_mode", {
    friendlyName: "Default !fm mode",
    category: "Now Playing",
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
  fmLovedEmoji: new UserScopedSetting("fm_loved_emoji", {
    friendlyName: "!fm loved emoji",
    description: "Control what emoji Gowon shows for loved tracks in your !fms",
    category: "Now Playing",
    type: SettingType.Choice,
    default: Emoji.heart,
    choices: [
      Emoji.heart,
      Emoji.pinkheart,
      Emoji.orangeheart,
      Emoji.yellowheart,
      Emoji.greenheart,
      Emoji.lightblueheart,
      Emoji.blueheart,
      Emoji.purpleheart,
      Emoji.blackheart,
      Emoji.whiteheart,
      Emoji.brownheart,
    ],
  }),
  fmUsernameDisplay: new UserScopedSetting("fm_username_display", {
    friendlyName: "!fm username display",
    description: "Control what username Gowon shows in your !fms",
    category: "Now Playing",
    type: SettingType.Choice,
    default: FMUsernameDisplay.LAST_FM_USERNAME,
    choices: [
      FMUsernameDisplay.DISCORD_USERNAME,
      FMUsernameDisplay.LAST_FM_USERNAME,
      FMUsernameDisplay.DISCORD_USERNAME_WITH_LINK,
    ],
  }),
  replyPings: new UserScopedSetting("reply_pings", {
    friendlyName: "Reply pings",
    description: "Control whether Gowon pings you when replying",
    category: "Configuration",
    type: SettingType.Toggle,
    default: toggleValues.OFF,
  }),

  // Bot scoped
  issueMode: new BotScopedSetting("issue_mode", {
    omitFromDashboard: true,
  }),
} satisfies Record<string, BaseSetting<unknown>>;

export type SettingsMap = {
  [K in keyof typeof Settings]: (typeof Settings)[K];
};
