import { Flag } from "./argumentTypes/Flag";
import { StringArgument } from "./argumentTypes/StringArgument";

export const prefabArguments = {
  artist: {
    artist: new StringArgument({ index: { start: 0 } }),
  },
  album: {
    artist: new StringArgument({ splitOn: "|" }),
    album: new StringArgument({ splitOn: "|", index: 1 }),
  },
  track: {
    artist: new StringArgument({ splitOn: "|" }),
    track: new StringArgument({ splitOn: "|", index: 1 }),
  },
} as const;

export const debugFlag = new Flag({
  description: "Developer only",
  longnames: ["debug"],
  shortnames: [],
});

export const prefabFlags = {
  noRedirect: new Flag({
    description: "Skip Last.fm's redirect",
    longnames: ["noredirect", "no-redirect"],
    shortnames: ["nr"],
  }),
} as const;
