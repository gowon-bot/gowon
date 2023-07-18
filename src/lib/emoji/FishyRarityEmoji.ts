export class FishyRarityEmoji {
  constructor(public base: string, private levels?: [string, string, string]) {}

  forLevel(level?: number) {
    return level && this.levels ? this.levels[level - 1] : this.base;
  }
}

export const FishyRarityEmojis = {
  trash: new FishyRarityEmoji("<:TrashRarity:1111855975121555507>"),
  common: new FishyRarityEmoji("<:common:1111855971136983131>", [
    "<:level1Common:1111856009112207451>",
    "<:level2Common:1111856225039175680>",
    "<:level3Common:1111857026025402472>",
  ]),
  uncommon: new FishyRarityEmoji("<:uncommon:1111855969987731466>", [
    "<:level1Uncommon:1111856007149273178>",
    "<:level2Uncommon:1111856223256584202>",
    "<:level3Uncommon:1111857024142147606>",
  ]),
  rare: new FishyRarityEmoji("<:rare:1111855968310022146>", [
    "<:level1Rare:1111856005979054150>",
    "<:level2Rare:1111856221629206558>",
    "<:level3Rare:1111857022732869632>",
  ]),
  superRare: new FishyRarityEmoji("<:superRare:1111855967051731004>", [
    "<:level1SuperRare:1111856004817236059>",
    "<:level2SuperRare:1111856220458979328>",
    "<:level3SuperRare:1111857021503930480>",
  ]),
  legendary: new FishyRarityEmoji("<:legendary:1111855965793423473>", [
    "<:level1Legendary:1111856002527137913>",
    "<:level2Legendary:1111856217686556743>",
    "<:level3Legendary:1111857019570372698>",
  ]),
  mythic: new FishyRarityEmoji("<:mythic:1111855963960528926>"),
  unknown: new FishyRarityEmoji("<:unknown:1111855973427052584>"),

  // Special rarities
  blahajRarity: new FishyRarityEmoji("<:blahaj:1111855972240064603>"),
} as const satisfies Record<string, FishyRarityEmoji>;
