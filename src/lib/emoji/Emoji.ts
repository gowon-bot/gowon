const extractionRegex = /<a?:\w+:([0-9]+)>/i;
const nameExtractionRegex = /<a?(:\w+:)[0-9]+>/i;

export function extractEmojiID(emoji: string): string {
  const id = extractionRegex.exec(emoji);

  return (id as RegExpMatchArray)?.[1] ?? "";
}

export function extractEmojiName(emoji: string): string {
  const name = emoji.match(nameExtractionRegex);

  return (name as RegExpMatchArray)[1];
}

export const Emoji = {
  spotify: "<:spotify:757100448548126720>",
  lastfm: "<:lastfm:879259073143517224>",
  gowonswag2: "<:gowonswag2:754923498786521088>",
  typescript: "<:typescript:746450416635609199>",
  gowonheart: "<:gowonheart:771235114277535764>",
  wail: "<:wail:751562824366555146>",
  gnop: "<:gnop:772245126571360256>",
  joppinh: "<a:joppinh:755881087905038387>",
  gronning: "<:gronning:774797344632995900>",
  kapp: "<:Kapp:775580682876747778>",
  loading: "<a:loading:784905179451359252>",
  ish: "<:ish:785397271725604875>",
  fmbot: "<:fmbot:822230495713689650>",
  rem: "<:rem:826270521788072026>",
  gowonRated: "<:gowonRated:843400034770223114>",
  blank: "<:blank:848334266928463882>",
  bruh: "<a:bruh:851935710298767371>",
  shitsfucked: "<:shitsfucked:857123087194521643>",
  gowonPeek: "<:gowonpeek:790528424933589002>",
  fuckyou: "<a:fuckyou:858239446577840140>",
  gowonLitDance: "<a:gowonLitDance:861185566233985044>",
  gowonPatreon: "<:gowonpatreon:883948448301334589>",
  404: "<:404:869383534429737031>",
  gowonScrobbled: "<:gowonScrobbled:944727673022849154>",
  fip: "<:fip:959302552443314227>",

  // Crowns
  yoink: "<:yoink:878053740941287434>",
  yoimk: "<:yoimk:1081458841960591430>",
  baited: "<:baited:1088895477300334644>",

  // Uses indexed data
  usesIndexedDataDescription: "<:uses_indexed_data:1056207690474467359>",
  usesIndexedDataLink: "<:uses_indexed_data2:1056204845683581048>",
  usesIndexedDataTitle: "<:uses_indexed_data3:1056207688696086581>",

  // RYM Stars
  fullStar: "<:fullStar:843763033858899968>",
  halfStar: "<:halfStar:843763307994284032>",
  emptyStar: "<:emptyStar:843763307428315148>",

  // Utlity reactions
  arrowLeft: "<:arrowleft:825600908594905107>",
  arrowRight: "<:arrowRight:825626338534490162>",
  arrowFirst: "<:arrowFirst:825626330648412180>",
  arrowLast: "<:arrowLast:825626334436917248>",
  checkmark: "<:checkmark:825628201354657823>",

  // Roles
  contentmoderator: "<:contentmoderator:913203995542175794>",
  alphatester: "<:gowonheart:771235114277535764>",
  betatester: "<:betatester:913203995663798322>",
  developer: "<:developer:913203995470888990>",
  "#swag": "<:swag:936102174394581032>",

  // Aquarium
  aquariumLeft: "<:AquariumLeft:1089731232952234044>",
  aquariumRight: "<:AquariumRight:1089731228581769356>",
  aquariumTop: "<:AquariumTop:1089731231022841997>",
  aquariumBottom: "<:AquariumBottom:1089731229793923093>",
  aquariumBottomLeft: "<:AquariumBottomLeft:1089731223460532274>",
  aquariumBottomRight: "<:AquariumBottomRight:1089731224844652576>",
  aquariumTopLeft: "<:AquariumTopLeft:1089731222101573773>",
  aquariumTopRight: "<:AquariumTopRight:1089731226568507413>",
  aquariumCoral: "<:AquariumCoral:1089735372055003229>",
  aquariumMoyai: "<:AquariumMoyai:1089735385694871602>",
  aquariumCastle: "<:AquariumCastle:1089735373850165258>",
  aquariumPlant: "<:AquariumPlant:1089735370599571546>",
  aquariumRock: "<:AquariumRock:1089735386965749901>",
  aquariumWater: "🟦",
  bubbles1: "<:Bubbles1:1089735378870734949>",
  bubbles2: "<:Bubbles2:1089735377239154688>",
  bubbles3: "<:Bubbles3:1089735375112634448>",

  // Fishy rarities
  trash: "<:trash:1091475743483109417>",
  common: "<:common:1091475742522622113>",
  uncommon: "<:uncommon:1091475741117517834>",
  rare: "<:rare:1091475739423031386>",
  superRare: "<:superRare:1091475737913073745>",
  legendary: "<:legendary:1091475736419901470>",
  mythic: "<:mythic:1091475734905757807>",
  unknown: "<:unknown:1103419210350202922>",

  blahajRarity: "<:blahajR:1103417169057947718>",

  // Fishy misc
  newFishy: "<:newFishy:1091512966672830594>",
} satisfies Record<string, string>;

export const EmojiRaw = Object.entries(Emoji).reduce(
  (acc, [shortName, code]) => {
    (acc as any)[shortName] = extractEmojiID(code);

    return acc;
  },
  {} as { [key in keyof typeof Emoji]: string }
);
