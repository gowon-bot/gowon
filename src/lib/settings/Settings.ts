import { GuildScopedSetting, GuildMemberScopedSetting   } from "./SettingTypes";

export const Settings = {
  inactiveRole: new GuildScopedSetting("inactive_role"),
  purgatoryRole: new GuildScopedSetting("purgatory_role"),
  prefix: new GuildScopedSetting("prefix"),
  optedOut: new GuildMemberScopedSetting("opted_out"),
} as const;

export type SettingsMap = {
  [K in keyof typeof Settings]: typeof Settings[K];
};
