const extractionRegex = /<a?:\w+:([0-9]+)>/i;
const nameExtractionRegex = /<a?(:\w+:)[0-9]+>/i;

export function extractEmojiID(emoji: string): string {
  const id = emoji.match(extractionRegex);

  return (id as RegExpMatchArray)[1];
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

  fullStar: "<:fullStar:843763033858899968>",
  halfStar: "<:halfStar:843763307994284032>",
  emptyStar: "<:emptyStar:843763307428315148>",

  arrowLeft: "<:arrowleft:825600908594905107>",
  arrowRight: "<:arrowRight:825626338534490162>",
  arrowFirst: "<:arrowFirst:825626330648412180>",
  arrowLast: "<:arrowLast:825626334436917248>",
  checkmark: "<:remirite:733081830705725512>",

  // Roles
  contentmoderator: "<:contentmoderator:913203995542175794>",
  betatester: "<:betatester:913203995663798322>",
  developer: "<:developer:913203995470888990>",
} as const;

export const EmojiRaw = Object.entries(Emoji).reduce(
  (acc, [shortName, code]) => {
    (acc as any)[shortName] = extractEmojiID(code);

    return acc;
  },
  {} as { [key in keyof typeof Emoji]: string }
);
