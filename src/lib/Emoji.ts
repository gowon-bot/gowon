const extractionRegex = /<a?:\w+:([0-9]+)>/i;

function extractEmojiID(emoji: string): string {
  const id = emoji.match(extractionRegex);

  return (id as RegExpMatchArray)[1];
}

export const Emoji = {
  spotify: "<:spotify:757100448548126720>",
  lastfm: "<:lastfm:757101691026800650>",
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
  fmbot: "<:fmbot:474719957226094602>",
} as const;

export const EmojiRaw = Object.entries(Emoji).reduce(
  (acc, [shortName, code]) => {
    (acc as any)[shortName] = extractEmojiID(code);

    return acc;
  },
  {} as { [key in keyof typeof Emoji]: string }
);
