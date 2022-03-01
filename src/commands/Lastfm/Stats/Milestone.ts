import { getOrdinal } from "../../../helpers";
import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { BadLastFMResponseError } from "../../../errors";
import { trackEmbed } from "../../../lib/views/embeds";
import { Validation } from "../../../lib/validation/ValidationChecker";
import { validators } from "../../../lib/validation/validators";
import { displayDateTime } from "../../../lib/views/displays";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { NumberArgument } from "../../../lib/context/arguments/argumentTypes/NumberArgument";

const args = {
  milestone: new NumberArgument({
    required: true,
    description: "The milestone to check",
  }),
  ...standardMentions,
} as const;

export default class Milestone extends LastFMBaseCommand<typeof args> {
  idSeed = "wooah lucy";

  aliases = ["mls", "ms"];
  description = "Shows you what you scrobbled at a given milestone";
  subcategory = "library stats";
  usage = ["", "milestone @user"];

  arguments = args;

  slashCommand = true;

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
    let milestone = this.parsedArguments.milestone;

    let { requestable, perspective } = await this.getMentions({
      asCode: false,
    });

    let track = await this.lastFMService.getMilestone(
      this.ctx,
      requestable,
      milestone
    );

    if (!track) throw new BadLastFMResponseError();

    let embed = this.newEmbed(trackEmbed(track));

    embed = embed
      .setAuthor({
        name: `${perspective.upper.possessive} ${getOrdinal(
          milestone
        )} track was:`,
      })
      .setDescription(
        embed.description +
          `\n\nScrobbled at ${displayDateTime(track.scrobbledAt)}`
      );

    await this.send(embed);
  }
}
