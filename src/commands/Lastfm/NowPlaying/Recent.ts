import { Arguments } from "../../../lib/arguments/arguments";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";
import { Validation } from "../../../lib/validation/ValidationChecker";
import { validators } from "../../../lib/validation/validators";
import { LastFMBaseCommand } from "../LastFMBaseCommand";

const args = {
  inputs: {
    amount: { index: 0, regex: /-?[0-9]+/g, default: 5, number: true },
  },
  mentions: standardMentions,
} as const;

export default class Recent extends LastFMBaseCommand<typeof args> {
  idSeed = "fx krystal";

  description = "Shows a few of your recent tracks";
  subcategory = "nowplaying";
  usage = ["", "amount"];

  arguments: Arguments = args;

  validation: Validation = {
    amount: new validators.Range({ min: 1, max: 15 }),
  };

  async run() {
    let amount = this.parsedArguments.amount;

    let { username, perspective } = await this.parseMentions();

    let recentTracks = await this.lastFMService.recentTracks({
      username,
      limit: amount,
    });

    let embed = this.newEmbed()
      .setTitle(`${perspective.upper.possessive} recent tracks`)
      .setDescription(
        recentTracks.track
          .map(
            (t) =>
              `${t.name} by ${t.artist["#text"].strong()} ${
                t.album?.["#text"] ? `from ${t.album["#text"].italic()}` : ""
              }`
          )
          .join("\n")
      );

    await this.send(embed);
  }
}
