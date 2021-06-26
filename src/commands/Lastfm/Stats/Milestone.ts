import { Arguments } from "../../../lib/arguments/arguments";
import { getOrdinal } from "../../../helpers";
import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { BadLastFMResponseError } from "../../../errors";
import { trackEmbed } from "../../../lib/views/embeds";
import { Validation } from "../../../lib/validation/ValidationChecker";
import { validators } from "../../../lib/validation/validators";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";
import { displayDateTime } from "../../../lib/views/displays";

const args = {
  inputs: {
    milestone: {
      regex: /-?[0-9]+/,
      index: 0,
      default: 1,
      number: true,
    },
  },
  mentions: standardMentions,
} as const;

export default class Milestone extends LastFMBaseCommand<typeof args> {
  idSeed = "wooah lucy";

  aliases = ["mls", "ms"];
  description = "Shows you what you scrobbled at a given milestone";
  subcategory = "library stats";
  usage = ["", "milestone @user"];

  arguments: Arguments = args;

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
    let milestone = this.parsedArguments.milestone!;

    let { requestable, perspective } = await this.parseMentions({
      asCode: false,
    });

    let track = await this.lastFMService.getMilestone(requestable, milestone);

    if (!track) throw new BadLastFMResponseError();

    let embed = this.newEmbed(trackEmbed(track))
      .setAuthor(
        `${perspective.upper.possessive} ${getOrdinal(milestone)} track was:`
      )
      .setFooter(`Scrobbled at ${displayDateTime(track.scrobbledAt)}`);

    await this.send(embed);
  }
}
