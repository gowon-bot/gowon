import { Arguments } from "../../../lib/arguments/arguments";
import { dateTimeDisplay, getOrdinal } from "../../../helpers";
import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { BadLastFMResponseError } from "../../../errors";
import { TrackEmbed } from "../../../helpers/Embeds";
import { Validation } from "../../../lib/validation/ValidationChecker";
import { validators } from "../../../lib/validation/validators";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";
import { fromUnixTime } from "date-fns";

export default class Milestone extends LastFMBaseCommand {
  aliases = ["mls", "ms"];
  description = "Shows you what you scrobbled at a given milestone";
  subcategory = "library stats";
  usage = ["", "milestone @user"];

  arguments: Arguments = {
    inputs: {
      milestone: {
        regex: /-?[0-9]+/,
        index: 0,
        default: 1,
        number: true,
      },
    },
    mentions: standardMentions,
  };

  validation: Validation = {
    milestone: [
      new validators.Number({}),
      new validators.Range({
        min: 1,
        max: 2000000,
        message: "please enter a valid milestone!",
      }),
    ],
  };

  async run() {
    let milestone = this.parsedArguments.milestone as number;

    let { username, perspective } = await this.parseMentions({
      asCode: false,
    });

    let track = await this.lastFMService.getMilestone(username, milestone);

    if (!track) throw new BadLastFMResponseError();

    let scrobbledAt = fromUnixTime(track.date.uts.toInt());

    let embed = TrackEmbed(track)
      .setAuthor(
        `${perspective.upper.possessive} ${getOrdinal(milestone)} track was:`
      )
      .setFooter(`Scrobbled at ${dateTimeDisplay(scrobbledAt)}`);

    await this.send(embed);
  }
}
