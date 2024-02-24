export const icons = {
  // Commmand icons
  runsInDMs: "<:runs_in_DMs:1116262516520124436>",
  doesNotRunInDMs: "<:does_not_run_in_DMs:1116262511428259881>",
  requiresAdmin: "<:requires_admin:1116285314332364930>",
  doesNotRequireAdmin: "<:does_not_require_admin:1116285311513800786>",
  slashCommand: "<:slash_command:1116262522085965824>",
  notASlashCommand: "<:not_a_slash_command:1116262520156590090>",

  // Fishy icons
  fishypediaMainTab: "<:main:1130055372367990886>",
  fishypediaTraitsTab: "<:traits:1130059610607325195>",

  // Utility icons

  help: "<:help:1206473330740297739>",
  error: "<:error:1206473332418023454>",
  warning: "<:warning:1206473333412208661>",
  info: "<:info:1206473334519365664>",

  checkmark: "<:checkmark:1206487809137967145>",
  x: "<:x_:1206487810337407036>",
} as const satisfies Record<string, string>;
