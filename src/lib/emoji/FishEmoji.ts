export class FishyEmoji {
  constructor(public raw: string, public inWater: string) {}
}

export class TrashEmoji extends FishyEmoji {
  constructor(emoji: string) {
    super(emoji, emoji);
  }
}

export const FishyEmojiList = {
  blueBetta: new FishyEmoji(
    "<:BlueBetta:1089149233627664424>",
    "<:BlueBettaWater:1089149235481550909>"
  ),
  smoothHeadBlobfish: new FishyEmoji(
    "<:SmoothheadBlobfish:1089146027665264680>",
    "<:SmoothheadBlobfishWater:1089145695816138853>"
  ),
  tripleWartSeadevil: new FishyEmoji(
    "<:TriplewartSeadevil:1089146085752184853>",
    "<:TriplewartSeadevilWater:1089147475383816263>"
  ),
  yellowBoxfish: new FishyEmoji(
    "<:YellowBoxfish:1089146037609975899>",
    "<:YellowBoxfishWater:1089147450394161213>"
  ),
  clownfish: new FishyEmoji(
    "<:Clownfish:1089146029556895774>",
    "<:ClownfishWater:1089147446308917280>"
  ),
  blueTang: new FishyEmoji(
    "<:BlueTang:1089146030592897095>",
    "<:BlueTangWater:1089147448112455801>"
  ),
  yellowTang: new FishyEmoji(
    "<:YellowTang:1089146035051450428>",
    "<:YellowTangWater:1089147449240723486>"
  ),
  walleye: new FishyEmoji(
    "<:Walleye:1089146039962968084>",
    "<:WalleyeWater:1089147453766373478>"
  ),
  chumSalmon: new FishyEmoji(
    "<:ChumSalmon:1089146041628119153>",
    "<:ChumSalmonWater:1089147455645433987>"
  ),
  chinookSalmon: new FishyEmoji(
    "<:ChinookSalmon:1089146038813728778>",
    "<:ChinookSalmonWater:1089147452281585746>"
  ),
  rainbowTrout: new FishyEmoji(
    "<:RainbowTrout:1089146043020619816>",
    "<:RainbowTroutWater:1089147457692258395>"
  ),
} satisfies Record<string, FishyEmoji>;
