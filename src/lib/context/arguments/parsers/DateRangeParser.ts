import { Duration } from "date-fns";
import escapeStringRegexp from "escape-string-regexp";
import { constants } from "../../../constants";
import { DateRange } from "../../../timeAndDate/DateRange";
import { parseDate, parseDateRange } from "../../../timeAndDate/helpers/parse";
import { NamedRangeParser } from "./NamedRangeParser";
import { BaseCustomParser } from "./custom";

export class DateRangeParser extends BaseCustomParser<DateRange | undefined> {
  private namedRangeParser = new NamedRangeParser();

  constructor(
    private options: {
      fallback?: Duration | "overall";
      useOverall?: boolean;
    } = {}
  ) {
    super();
  }

  parse(string: string): DateRange | undefined {
    const explicitDateRange = this.parseExplicitDateRangeRegex(string);

    if (explicitDateRange) return explicitDateRange;

    const namedRange = this.namedRangeParser.parse(string);

    if (namedRange) return namedRange;

    return parseDateRange(string, this.options);
  }

  private parseExplicitDateRangeRegex(string: string): DateRange | undefined {
    const regex = this.buildExplicitDateRangeRegex();

    const [, date1, _, date2] = string.match(regex) ?? [];

    console.log(date1, date2);

    if (date1 && date2) {
      const parsedDate1 = parseDate(date1, ...constants.dateParsers);
      const parsedDate2 = parseDate(date2, ...constants.dateParsers);

      console.log(parsedDate1, parsedDate2);

      if (parsedDate1 && parsedDate2) {
        console.log(
          "Date range: ",
          new DateRange({ from: parsedDate1, to: parsedDate2 })
        );

        return new DateRange({ from: parsedDate1, to: parsedDate2 });
      }
    }

    return undefined;
  }

  private buildExplicitDateRangeRegex(): RegExp {
    const dateFormats = constants.dateParsers
      .map((p) =>
        escapeStringRegexp(p)
          .replace(/yyyy|yy/i, (m) => "\\d".repeat(m.length))
          .replace(/dd/i, "\\d\\d?")
          .replace(/mm/i, "\\d\\d?")
      )
      .join("|");

    return new RegExp(`(${dateFormats})\\s*(-|to)\\s*(${dateFormats})`, "i");
  }
}
