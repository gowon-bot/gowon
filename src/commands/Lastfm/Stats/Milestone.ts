import { Arguments } from "../../../lib/arguments/arguments";
import { getOrdinal } from "../../../helpers";
import { LastFMBaseCommand } from "../LastFMBaseCommand";
import { LogicError, BadLastFMResponseError } from "../../../errors";
import { TrackEmbed } from "../../../helpers/Embeds";

export default class Milestone extends LastFMBaseCommand {
  aliases = ["mls"];
  description = "Shows you what you scrobbled at a certain milestone";
  subcategory = "library stats";
  usage = ["", "milestone @user"];

  arguments: Arguments = {
    inputs: {
      milestone: {
        regex: /[0-9]{1,8}/,
        index: { start: 0 },
        default: 1,
        number: true,
      },
    },
    mentions: {
      user: {
        index: 0,
        description: "The user to lookup",
        nonDiscordMentionParsing: this.ndmp,
      },
    },
  };

  async run() {
    let milestone = this.parsedArguments.milestone as number;

    if (milestone <= 0) throw new LogicError("please enter a valid milestone!");

    let { username, perspective } = await this.parseMentionedUsername({
      asCode: false,
    });

    let track = await this.lastFMService.getMilestone(username, milestone);

    if (!track) throw new BadLastFMResponseError();

    let embed = TrackEmbed(track).setAuthor(
      `${perspective.upper.possessive} ${getOrdinal(milestone)} track was:`
    );

    await this.send(embed);
  }
}
