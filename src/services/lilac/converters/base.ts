import { fromUnixTime } from "date-fns";
import { LilacDate } from "../LilacAPIService.types";

export abstract class BaseLilacConverter {
  protected convertDate(date?: LilacDate): Date | undefined {
    if (!date) return undefined;

    return fromUnixTime(date);
  }
}
