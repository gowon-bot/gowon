export const VARIATIONS = {
  global: (...prefixes: string[]) => ({
    name: "global",
    variation: prefixes.map((p) => "g" + p),
    description: "Queries everyone logged into Gowon",
  }),
} as const;
