import { Crown } from "../../database/entity/Crown";
import { User } from "../../database/entity/User";
import { UserNotFoundError } from "../../errors";
import { Message, User as DiscordUser } from "discord.js";
import { BaseService } from "../BaseService";

export enum CrownState {
  tie = "Tie",
  snatched = "Snatched",
  fail = "Fail",
  newCrown = "New crown",
  updated = "Updated",
  tooLow = "Too low",
}

export interface CrownCheck {
  crown?: Crown;
  oldCrown?: Crown;
  state: CrownState;
}

export interface CrownOptions {
  serverID: string;
  discordID: string;
  artistName: string;
  plays: number;
}

export class CrownsService extends BaseService {
  threshold = 30;

  private async handleSelfCrown(
    crown: Crown,
    plays: number
  ): Promise<CrownState> {
    if (crown.plays === plays) {
      return CrownState.updated;
    } else if (plays < this.threshold) {
      // delete the crown
      return CrownState.updated;
    } else {
      crown.plays = plays;
      await crown.save();
      return CrownState.updated;
    }
  }

  private async handleCrown(
    crown: Crown,
    plays: number,
    user: User
  ): Promise<CrownState> {
    if (crown.plays < plays) {
      crown.user = user;
      crown.plays = plays;

      await crown.save();

      return CrownState.snatched;
    } else if (plays < crown.plays) return CrownState.fail;
    else if (plays < this.threshold) return CrownState.tooLow;
    else if (crown.plays === plays) return CrownState.tie;
    else return CrownState.fail;
  }

  async checkCrown(crownOptions: CrownOptions): Promise<CrownCheck> {
    let { discordID, artistName, plays, serverID } = crownOptions;
    this.log(`Checking crown for user ${discordID} and artist ${artistName}`);

    let [crown, user] = await Promise.all([
      Crown.getCrown(serverID, artistName),
      User.findOne({ where: { discordID } }),
    ]);

    let oldCrown = Object.assign({}, crown);

    if (!user) throw new UserNotFoundError();

    let crownState: CrownState;

    if (crown) {
      if (crown.user.id === user.id) {
        crownState = await this.handleSelfCrown(crown, plays);
      } else {
        crownState = await this.handleCrown(crown, plays, user);
      }

      return { crown: crown, state: crownState, oldCrown };
    } else {
      this.log("Creating crown for " + artistName);
      if (plays < this.threshold) return { state: CrownState.tooLow };

      let crown = Crown.create({
        user,
        artistName,
        plays,
        serverID,
        version: 1,
      });

      await crown.save();

      return {
        crown: crown,
        state: CrownState.newCrown,
        oldCrown,
      };
    }
  }

  async getCrown(artistName: string): Promise<Crown | undefined> {
    this.log("Fetching crown for " + artistName);
    return await Crown.findOne({ where: { artistName } });
  }

  async getCrownDisplay(
    artistName: string,
    message: Message
  ): Promise<{ crown: Crown; user?: DiscordUser } | undefined> {
    let crown = await this.getCrown(artistName);

    if (!crown) return;

    let user = (await message.guild?.members.fetch(crown?.user.discordID))
      ?.user;

    return { crown, user };
  }

  async listTopCrowns(discordID: string, limit = 10): Promise<Crown[]> {
    this.log("Listing crowns for user " + discordID);
    let user = await User.findOne({ where: { discordID } });

    if (!user) throw new UserNotFoundError();

    return await Crown.find({
      where: { user },
      order: { plays: "DESC" },
      take: limit,
    });
  }

  async count(discordID: string): Promise<number> {
    this.log("Counting crowns for user " + discordID);
    let user = await User.findOne({ where: { discordID } });

    if (!user) throw new UserNotFoundError();

    return await Crown.count({ where: { user } });
  }
}
