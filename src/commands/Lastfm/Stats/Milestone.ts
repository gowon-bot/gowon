import { BadLastFMResponseError } from "../../../errors/errors";
import { getOrdinal } from "../../../helpers";
import { NumberArgument } from "../../../lib/context/arguments/argumentTypes/NumberArgument";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { ArgumentsMap } from "../../../lib/context/arguments/types";
import { Validation } from "../../../lib/validation/ValidationChecker";
import { validators } from "../../../lib/validation/validators";
import { displayDateTime } from "../../../lib/views/displays";
import { trackEmbed } from "../../../lib/views/embeds";
import { LastFMBaseCommand } from "../LastFMBaseCommand";

const args = {
  milestone: new NumberArgument({
    required: true,
    description: "The milestone to check",
  }),
  ...standardMentions,
} satisfies ArgumentsMap;

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
      new validators.NumberValidator({}),
      new validators.RangeValidator({
        min: 1,
        max: 2000000,
        message: "please enter a valid milestone!",
      }),
    ],
  };

  async run() {
    const milestone = this.parsedArguments.milestone;

    const { requestable, perspective } = await this.getMentions({
      perspectiveAsCode: false,
    });

    const track = await this.lastFMService.getMilestone(
      this.ctx,
      requestable,
      milestone
    );

    if (!track) throw new BadLastFMResponseError();

    let embed = this.newEmbed(await trackEmbed(this.ctx, track));

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
