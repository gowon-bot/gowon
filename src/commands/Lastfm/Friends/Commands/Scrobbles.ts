import { FriendsChildCommand } from "../FriendsChildCommand";
import { MultiRequester } from "../../../../lib/MultiRequester";
import { Arguments } from "../../../../lib/arguments/arguments";

import { displayNumber } from "../../../../lib/views/displays";
import { TimeRangeParser } from "../../../../lib/arguments/custom/TimeRangeParser";

const args = {
  inputs: {
    timeRange: {
      custom: new TimeRangeParser({ useOverall: true, fallback: "overall" }),
    },
  },
} as const;

export class Scrobbles extends FriendsChildCommand<typeof args> {
  idSeed = "nature sohee";

  description = "Shows how many scrobbles your friends have";
  aliases = ["s"];
  usage = ["", "time period"];

  arguments: Arguments = args;

  throwIfNoFriends = true;

  async run() {
    const timeRange = this.parsedArguments.timeRange!;

    const scrobbles = await new MultiRequester(this.ctx, [
      ...this.friendUsernames,
      this.senderRequestable,
    ]).fetch(this.lastFMService.getNumberScrobbles.bind(this.lastFMService), [
      timeRange.from,
      timeRange.to,
    ]);

    const embed = this.newEmbed()
      .setTitle(`Your friends scrobbles ${timeRange.humanized}`)
      .setDescription(
        Object.keys(scrobbles)
          .sort(
            (a, b) => (scrobbles[b] ?? -Infinity) - (scrobbles[a] ?? -Infinity)
          )
          .map((username) => {
            let s = scrobbles[username];

            if (!s)
              return this.displayMissingFriend(username, "scrobble count");

            return `${username.code()} - **${displayNumber(s, "**scrobble")}`;
          })
          .join("\n")
      );

    await this.send(embed);
  }
}
