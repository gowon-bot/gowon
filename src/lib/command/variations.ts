export const VARIATIONS = {
  update: (...prefixes: string[]) => ({
    name: "update",
    variation: prefixes.map((p) => "u" + p),
    description: "Updates the author before running the command",
  }),
  global: (...prefixes: string[]) => ({
    name: "global",
    variation: prefixes.map((p) => "g" + p),
    description: "Queries everyone logged into Gowon",
  }),
} as const;
