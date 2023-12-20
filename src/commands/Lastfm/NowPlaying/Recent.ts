import { bold, italic } from "../../../helpers/discord";
import { LastfmLinks } from "../../../helpers/lastfm/LastfmLinks";
import { bullet } from "../../../helpers/specialCharacters";
import { requestableAsUsername } from "../../../lib/MultiRequester";
import { NumberArgument } from "../../../lib/context/arguments/argumentTypes/NumberArgument";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { ArgumentsMap } from "../../../lib/context/arguments/types";
import { Validation } from "../../../lib/validation/ValidationChecker";
import { validators } from "../../../lib/validation/validators";
import {
  displayLink,
  displayNumberedList,
  displayTime,
} from "../../../lib/views/displays";
import { RecentTrack } from "../../../services/LastFM/converters/RecentTracks";
import { LastFMBaseCommand } from "../LastFMBaseCommand";

const args = {
  amount: new NumberArgument({
    default: 5,
    description: "The amount of recent tracks to show",
  }),
  ...standardMentions,
} satisfies ArgumentsMap;

export default class Recent extends LastFMBaseCommand<typeof args> {
  idSeed = "fx krystal";

  description = "Shows a few of your recent tracks";
  subcategory = "nowplaying";
  usage = ["", "amount"];

  slashCommand = true;

  arguments = args;

  validation: Validation = {
    amount: new validators.RangeValidator({ min: 1, max: 15 }),
  };

  async run() {
    const amount = this.parsedArguments.amount;

    const { requestable, perspective } = await this.getMentions();

    const recentTracks = await this.lastFMService.recentTracks(this.ctx, {
      username: requestable,
      limit: amount,
    });

    const albumCover = await this.albumCoverService.get(
      this.ctx,
      recentTracks.first().images.get("large"),
      {
        metadata: {
          artist: recentTracks.first().artist,
          album: recentTracks.first().album,
        },
      }
    );

    const embed = this.authorEmbed()
      .setHeader(
        `${perspective.upper.possessive.replace(/`/g, "")} recent tracks`
      )
      .setHeaderURL(LastfmLinks.userPage(requestableAsUsername(requestable)))
      .setDescription(
        (recentTracks.isNowPlaying
          ? `\`${amount! > 9 ? " " : ""}•\`. ` +
            this.displayTrack(recentTracks.nowPlaying!) +
            "\n"
          : "") +
          displayNumberedList(
            recentTracks.withoutNowPlaying.map(this.displayTrack)
          )
      )
      .setThumbnail(albumCover || "");

    await this.send(embed);
  }

  private displayTrack(t: RecentTrack) {
    return `${displayLink(t.name, t.url)} by ${bold(t.artist)} ${
      t.album
        ? `
${displayTime(t.scrobbledAt)} ${bullet} from ${italic(t.album)}\n`
        : "\n"
    }`;
  }
}
