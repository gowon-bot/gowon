import { LogicError } from "../../../errors/errors";
import { DateArgument } from "../../../lib/context/arguments/argumentTypes/timeAndDate/DateArgument";
import { DateRangeArgument } from "../../../lib/context/arguments/argumentTypes/timeAndDate/DateRangeArgument";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { ArgumentsMap } from "../../../lib/context/arguments/types";
import { Image } from "../../../lib/ui/Image";
import { displayDate } from "../../../lib/ui/displays";
import { TrackEmbed } from "../../../lib/ui/embeds/TrackEmbed";
import { Validation } from "../../../lib/validation/ValidationChecker";
import { validators } from "../../../lib/validation/validators";
import { LastFMBaseCommand } from "../LastFMBaseCommand";

const args = {
  dateRange: new DateRangeArgument({
    description: "The amount of time to go back",
  }),
  date: new DateArgument({
    description: "The date to go back to (yyyy/mm/dd)",
  }),
  ...standardMentions,
} satisfies ArgumentsMap;

export default class GoBack extends LastFMBaseCommand<typeof args> {
  idSeed = "wooah sora";

  aliases = ["gb"];
  description = "Shows what you scrobbled in the past...";
  subcategory = "library stats";
  usage = ["time period @user"];

  arguments = args;

  slashCommand = true;

  validation: Validation = {
    dateRange: {
      validator: new validators.DateRangeValidator({
        requireFrom: true,
        treatOnlyToAsEmpty: true,
      }),
      friendlyName: "time range",
    },
  };

  async run() {
    const dateRange = this.parsedArguments.dateRange,
      date = this.parsedArguments.date;

    if (!date && !dateRange?.from) {
      throw new LogicError("please enter a valid date or time range!");
    }

    const { requestable, perspective } = await this.getMentions({
      perspectiveAsCode: false,
    });

    const track = await this.lastFMService.goBack(
      this.ctx,
      requestable,
      (date || dateRange?.from)!
    );

    if (!track) {
      throw new LogicError(
        `${perspective.plusToHave} not scrobbled any tracks in that time period!`
      );
    }

    const albumCover = await this.albumCoverService.getFromSimpleTrack(
      this.ctx,
      track
    );

    const embed = this.authorEmbed()
      .transform(TrackEmbed)
      .setTrack(track)
      .setAlbumCover(albumCover ? Image.fromURL(albumCover) : undefined)
      .addDescription(`\n\nScrobbled on ${displayDate(track.scrobbledAt)}`);

    await this.send(embed);
  }
}
