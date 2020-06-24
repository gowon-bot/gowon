import { Crown } from "../../database/entity/Crown";
import { User } from "../../database/entity/User";
import { UserNotFoundError } from "../../errors";

export enum CrownState {
  tie = "tie",
  snatched = "snatched",
  fail = "fail",
  newCrown = "new crown",
  updated = "updated",
  tooLow = "too low",
}

export interface CrownCheck {
  crown: Crown;
  oldCrown?: Crown;
  state: CrownState;
}

export class CrownsService {
  async checkCrown(crownOptions: {
    serverID: string;
    discordID: string;
    artistName: string;
    plays: number;
  }): Promise<CrownCheck> {
    let { discordID, artistName, plays, serverID } = crownOptions;

    let [crown, user] = await Promise.all([
      Crown.getCrown(serverID, artistName),
      User.findOne({ where: { discordID } }),
    ]);

    let oldCrown = Object.assign({}, crown);

    if (!user) throw new UserNotFoundError();

    if (crown) {
      if (crown.plays < plays) {
        let state =
          crown.user.id === user.id ? CrownState.updated : CrownState.snatched;

        crown.user = user;
        crown.plays = plays;
        crown.version++;

        await crown.save();

        return { crown, state, oldCrown };
      } else if (crown.plays === plays) {
        return { crown, state: CrownState.tie, oldCrown };
      } else return { crown, state: CrownState.fail, oldCrown };
    } else {
      let crown = Crown.create({
        user,
        artistName,
        plays,
        serverID,
        version: 1,
      });

      await crown.save();

      return { crown: crown, state: CrownState.newCrown, oldCrown };
    }
  }
}
