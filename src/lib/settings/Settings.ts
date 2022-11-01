import {
  GuildScopedSetting,
  GuildMemberScopedSetting,
  UserScopedSetting,
  BotScopedSetting,
} from "./SettingTypes";
import { defaultPrefix } from "../../../config.json";
import { toggleValues } from "./SettingValues";

export const Settings = {
  // Guild scoped
  adminRole: new GuildScopedSetting("admin_role", {
    friendlyName: "Admin role",
    description:
      "What role is allowed to run admin commands. (all 'Administator' users can run them by default)",
    type: "role",
  }),
  prefix: new GuildScopedSetting("prefix", {
    friendlyName: "Prefix",
    description: `What prefix the bot uses (defaults to ${defaultPrefix})`,
    type: "textshort",
  }),
  inactiveRole: new GuildScopedSetting("inactive_role", {
    category: "Crowns",
    friendlyName: "Inactive role",
    description: "What role Gowon counts as inactive in the crowns game",
    type: "role",
  }),
  purgatoryRole: new GuildScopedSetting("purgatory_role", {
    category: "Crowns",
    friendlyName: "Purgatory role",
    description:
      "What role Gowon counts as 'in purgatory' (ie. cheating scrobbles) in the crowns game",
    type: "role",
  }),
  strictTagBans: new GuildScopedSetting("strict_tag_bans", {
    friendlyName: "Strict tag bans",
    description: "Prevents users from inputting banned tags to commands",
    type: "toggle",
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
    category: "spotify",
  }),
  spotifyPrivateMode: new UserScopedSetting("spotify_private_mode", {
    friendlyName: "Private mode",
    category: "spotify",
    description: "Doesn't show info that could reveal your Spotify account",
    default: toggleValues.ON,
  }),
  defaultFMMode: new UserScopedSetting("default_fm_mode", {
    friendlyName: "Default !fm mode",
    category: "customization",
    description: "Control which type of embed Gowon uses when you !fm",
  }),
  timezone: new UserScopedSetting("timezone", {
    friendlyName: "Timezone",
    description: "Control what timezone Gowon uses",
    omitFromDashboard: true,
    category: "configuration",
  }),

  // Bot scoped
  issueMode: new BotScopedSetting("issue_mode", {
    omitFromDashboard: true,
  }),
  noTwitter: new BotScopedSetting("no_twitter", {
    omitFromDashboard: true,
  }),
} as const;

export type SettingsMap = {
  [K in keyof typeof Settings]: typeof Settings[K];
};
