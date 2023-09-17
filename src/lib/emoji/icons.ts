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
  error: "<:error:1148943982437597224>",
  warning: "<:gowarning:1148943986720002098>",
  info: "<:info:1148943985080021052>",
} as const satisfies Record<string, string>;
