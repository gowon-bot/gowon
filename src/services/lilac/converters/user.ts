import { LilacPrivacy, RawLilacUser } from "../LilacAPIService.types";
import { BaseLilacConverter } from "./base";

export class LilacUser extends BaseLilacConverter {
  id: number;
  username: string;
  discordID: string;
  privacy: LilacPrivacy;
  lastUpdated?: Date;

  constructor(raw: RawLilacUser) {
    super();

    this.id = raw.id;
    this.username = raw.username;
    this.discordID = raw.discordId;
    this.privacy = raw.privacy;
    this.lastUpdated = this.convertDate(raw.lastIndexed);
  }
}
