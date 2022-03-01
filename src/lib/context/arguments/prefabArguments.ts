import { Flag } from "./argumentTypes/Flag";
import { StringArgument } from "./argumentTypes/StringArgument";

export const prefabArguments = {
  artist: {
    artist: new StringArgument({
      index: { start: 0 },
      description:
        "The artist to use (defaults to your currently playing artist)",
    }),
  },
  requiredArtist: {
    artist: new StringArgument({
      index: { start: 0 },
      description:
        "The artist to use (defaults to your currently playing artist)",
      required: true,
    }),
  },
  album: {
    artist: new StringArgument({
      splitOn: "|",
      description:
        "The artist to use (defaults to your currently playing artist)",
    }),
    album: new StringArgument({
      splitOn: "|",
      index: 1,
      description:
        "The album to use (defaults to your currently playing album)",
    }),
  },
  track: {
    artist: new StringArgument({
      splitOn: "|",
      description:
        "The artist to use (defaults to your currently playing artist)",
    }),
    track: new StringArgument({
      splitOn: "|",
      index: 1,
      description:
        "The track to use (defaults to your currently playing track)",
    }),
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
  equal: new Flag({
    shortnames: ["e"],
    longnames: ["equal"],
    description: "Check plays equal instead of plays over",
  }),
} as const;
