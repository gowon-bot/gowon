import { flatDeep, ucFirst } from "../../helpers";
import { toInt } from "../../helpers/lastFM";
import { NamedRange, TimeRange } from "./helpers";

export class NamedRangeParser {
  private months = [
    ["january", "jan", "yeojin", "gowon"],
    ["february", "feb"],
    ["march", "mar", "hyejoo"],
    ["april", "apr", "vivi"],
    ["may", "kim lip"],
    ["june", "jun", "jinsoul"],
    ["july", "jul", "choerry"],
    ["august", "aug"],
    ["september", "sept", "sep"],
    ["october", "oct", "heejin"],
    ["november", "nov", "yves", "hyunjin"],
    ["december", "dec", "chuu", "haseul"],
  ];

  private yearRegex = "2\\d{3}";

  private rangeRegex(lhs: string) {
    return `${lhs}\\s*(\\-)?\\s*(${lhs})?`;
  }

  private get monthsRegex() {
    return `(${flatDeep(this.months).join("|")})`;
  }

  parse(string: string): TimeRange | undefined {
    const regex = new RegExp(
      this.rangeRegex(`(${this.monthsRegex})?\\s*(${this.yearRegex})?`),
      "i"
    );

    const matches = string.trim().match(regex);

    return this.handleMatches(matches || []);
  }

  isNamedRange(string: string) {
    return this.getMonthNumber(string) != -1;
  }

  private handleMatches([_, m1, __, y1, hyphen, ___, m2, ____, y2]: Array<
    string | undefined
  >): TimeRange | undefined {
    if (!m1 && !y1 && !m2 && !y2) return undefined;

    if (y2 && !y2 && !m1) {
      y1 = y2;
      y2 = undefined;
    }

    if (m2 && !m1) {
      m1 = m2;
      m2 = undefined;
    }

    const namedRange = new NamedRange(
      ...this.constructHumanized(m1, y1, hyphen, m2, y2)
    );

    const date1 = this.constructDate("start", m1, y1);
    let date2 = this.constructDate("end", m2, y2);

    if (date1 && hyphen && !date2) {
      date2 = new Date();
    }

    if (!date1 && !date2) return undefined;

    return new TimeRange({
      ...this.arrangeDates(m1 ? "month" : "year", date1!, date2),
      namedRange,
    });
  }

  private constructDate(
    position: "start" | "end",
    month?: string,
    year?: string
  ): Date | undefined {
    if (!month && !year) return undefined;

    const today = new Date();

    const parsedYear = !year ? today.getFullYear() : toInt(year);
    const parsedMonth = !month
      ? position === "start"
        ? 0
        : 11
      : this.getMonthNumber(month);
    // If it's the start, the first day of the month
    // If it's the end, the last day of the month
    const parsedDay =
      position === "start" ? 1 : new Date(2001, parsedMonth + 1, 0).getDate();

    return new Date(parsedYear, parsedMonth, parsedDay);
  }

  private arrangeDates(
    scale: "month" | "year",
    date1: Date,
    date2?: Date
  ): { to?: Date; from?: Date } {
    let to: Date | undefined = undefined,
      from: Date | undefined = undefined;

    if (date2 && date1 > date2) {
      from = date2;
      to = date1;
    } else if (date2 && date1 < date2) {
      from = date1;
      to = date2;
    } else {
      from = date1;
      to = this.getEndOfPeriod(date1, scale);
    }

    return { to, from };
  }

  private getEndOfPeriod(date: Date, scale: "month" | "year") {
    if (scale === "month") {
      return new Date(date.getFullYear(), date.getMonth() + 1, 0);
    } else {
      // 0th day of the 0th month
      // is actually the last day of the 12th
      return new Date(date.getFullYear() + 1, 0, 0);
    }
  }

  private getMonthNumber(month: string): number {
    return this.months.findIndex((m) => m.includes(month.toLowerCase()));
  }

  private constructHumanized(
    m1?: string,
    y1?: string,
    hyphen?: string,
    m2?: string,
    y2?: string
  ): [string, string] {
    const from = [] as string[];
    const to = [] as string[];

    if (m1) from.push(ucFirst(this.months[this.getMonthNumber(m1)][0]));
    if (y1) from.push(`${y1}`);
    if (m2) to.push(ucFirst(this.months[this.getMonthNumber(m2)][0]));
    if (y2) to.push(`${y2}`);
    if (hyphen && !m2 && !y2) to.push("today");

    return [from.join(" "), to.join(" ")];
  }
}
