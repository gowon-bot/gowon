import { LastFMPeriod } from "../../../../services/LastFM/LastFMService.types";
import { BaseCustomParser } from "./custom";

export const overallRegex = /(\s+|\b)(a(lltime)?|o(verall)?)(\s|\b)/gi;

export class TimePeriodParser extends BaseCustomParser<
  LastFMPeriod | undefined
> {
  constructor(private options: { fallback?: LastFMPeriod } = {}) {
    super();
  }

  parse(string: string) {
    return parsePeriod(string, this.options.fallback);
  }
}

function parsePeriod(
  string: string,
  fallback?: LastFMPeriod
): LastFMPeriod | undefined {
  const periodRegexes: { [period: string]: RegExp } = {
    "7day": /(\s+|\b)(w(eek)?)(\s|\b)/gi,
    "3month": /(\s+|\b)(q(uarter)?)(\s|\b)/gi,
    "6month": /(\s+|\b)h(alf(\s*year)?)?(\s|\b)/gi,
    "12month": /(\s+|\b)(y(ear)?)(\s|\b)/gi,
    "1month": /(\s+|\b)m(o(nth?)?)?(\s|\b)/gi,
    overall: overallRegex,
  };

  for (const period of Object.keys(periodRegexes)) {
    const regex = periodRegexes[period];

    const matches = string.match(regex) || [];

    if (matches.length) return period as LastFMPeriod;
  }

  return fallback;
}
