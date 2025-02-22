export const icons = {
  // Commmand icons
  runsInDMs: "<:runs_in_DMs:1197111557918826506>",
  doesNotRunInDMs: "<:doesnt_run_in_DMs:1197111554550796308>",
  requiresAdmin: "<:requires_admin:1197111556736032828>",
  doesNotRequireAdmin: "<:doesnt_require_admin:1197111555632926760>",
  slashCommand: "<:slash_command:1197111552613031996>",
  notASlashCommand: "<:not_a_slash_command:1197111560297005066>",

  // Fishy icons
  fishypediaMainTab: "<:main:1197111530332885042>",
  fishypediaTraitsTab: "<:traits:1197111528743252008>",

  // Utility icons
  help: "<:help:1206473330740297739>",
  error: "<:error:1206473332418023454>",
  warning: "<:warning:1206473333412208661>",
  info: "<:info:1206473334519365664>",

  checkmark: "<:checkmark:1211091352943591524>",
  x: "<:x_:1206487810337407036>",

  // RYM Stars
  fullStar: "<:fullStar:1197111483830632488>",
  halfStar: "<:halfStar:1197111481637023825>",
  emptyStar: "<:emptyStar:1197111482689802281>",

  // Utlity reactions
  arrowFirst: "<:first:1197111484967292928>",
  arrowLeft: "<:previous:1197111409302065162>",
  arrowRight: "<:next:1197111479883812895>",
  arrowLast: "<:last:1197111411055263764>",

  // Progress bar icons
  remainingProgress: "<:loading:1197111489337761832>",
  progress: "<:progress:1197111521109618758>",
  moreProgress: "<:moreProgress:1197111523064164362>",
  evilProgress: "<:evilProgress:1342478443798986842>",

  // Native emoji overrides
  fire: "<:fire:1197111444542595162>",
  chart: "<:chart:1197111406793850900>",
  tada: "<:tada:1197111408052158504>",
  confettiBall: "<:confettiBall:1197111405762052146>",
  crown: "<:crown:1197111412162580562>",
} as const satisfies Record<string, string>;
