import { MirrorballError } from "../../../../../errors/errors";
import { Variation } from "../../../../../lib/command/BaseCommand";
import { VARIATIONS } from "../../../../../lib/command/variations";
import { prefabArguments } from "../../../../../lib/context/arguments/prefabArguments";
import {
  displayNumber,
  displayNumberedList,
} from "../../../../../lib/views/displays";
import { WhoKnowsBaseCommand } from "../WhoKnowsBaseCommand";
import {
  WhoKnowsTrackConnector,
  WhoKnowsTrackParams,
  WhoKnowsTrackResponse,
} from "./WhoKnowsTrack.connector";

const args = {
  ...prefabArguments.track,
} as const;

export default class WhoKnowsTrack extends WhoKnowsBaseCommand<
  WhoKnowsTrackResponse,
  WhoKnowsTrackParams,
  typeof args
> {
  connector = new WhoKnowsTrackConnector();

  idSeed = "redsquare lina";

  aliases = ["wkt", "fmwkt"];
  subcategory = "whoknows";

  variations: Variation[] = [
    VARIATIONS.update("wkt"),
    VARIATIONS.global("wkt"),
  ];

  description = "See who knows a track";

  slashCommand = true;

  arguments = args;

  async run() {
    const { senderRequestable, senderMirrorballUser, senderUser } =
      await this.getMentions({
        senderRequired:
          !this.parsedArguments.artist || !this.parsedArguments.track,
        fetchMirrorballUser: true,
      });

    const { artist: artistName, track: trackName } =
      await this.lastFMArguments.getTrack(this.ctx, senderRequestable);

    if (this.variationWasUsed("update")) {
      await this.updateAndWait(this.author.id);
    }

    const response = await this.query({
      track: { name: trackName, artist: { name: artistName } },
      settings: {
        guildID: this.isGlobal() ? undefined : this.requiredGuild.id,
        limit: 20,
      },
    });

    const errors = this.parseErrors(response);

    if (errors) {
      throw new MirrorballError(errors.errors[0].message);
    }

    const { rows, track } = response.whoKnowsTrack;

    await this.cacheUserInfo(response.whoKnowsTrack.rows.map((u) => u.user));

    let trackDisplay = track.name;
    let artistDisplay = track.artist;

    if (!trackDisplay && !artistDisplay) {
      const trackResponse = await this.lastFMService.correctTrack(this.ctx, {
        artist: artistName,
        track: trackName,
      });

      trackDisplay = trackResponse.track;
      artistDisplay = trackResponse.artist;
    }

    const embed = this.whoKnowsEmbed()
      .setTitle(
        `Who knows ${trackDisplay.italic()} by ${artistDisplay.strong()}${
          this.isGlobal() ? " globally" : ""
        }?`
      )
      .setDescription(
        !track || rows.length === 0
          ? `No one knows this track`
          : displayNumberedList(
              rows.map(
                (wk) =>
                  `${this.displayUser(wk.user)} - **${displayNumber(
                    wk.playcount,
                    "**play"
                  )}`
              )
            )
      )
      .setFooter({ text: this.footerHelp(senderUser, senderMirrorballUser) });

    await this.send(embed);
  }
}
