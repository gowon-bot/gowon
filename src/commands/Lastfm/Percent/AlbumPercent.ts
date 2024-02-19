import { bold, italic } from "../../../helpers/discord";
import { calculatePercent } from "../../../helpers/stats";
import { standardMentions } from "../../../lib/context/arguments/mentionTypes/mentions";
import { prefabArguments } from "../../../lib/context/arguments/prefabArguments";
import { ArgumentsMap } from "../../../lib/context/arguments/types";
import { displayNumber } from "../../../lib/ui/displays";
import { LastFMBaseCommand } from "../LastFMBaseCommand";

const args = {
  ...prefabArguments.album,
  ...standardMentions,
} satisfies ArgumentsMap;

export default class AlbumPercent extends LastFMBaseCommand<typeof args> {
  idSeed = "twice chaeyoung";

  aliases = ["lpct", "alpct"];
  description =
    "Shows you what percentage of an artist's scrobbles are made up by a certain album";
  subcategory = "percents";
  usage = ["", "artist | album"];

  slashCommand = true;

  arguments = args;

  async run() {
    const { requestable, senderRequestable, perspective } =
      await this.getMentions({
        senderRequired:
          !this.parsedArguments.artist || !this.parsedArguments.album,
      });

    const { artist, album } = await this.lastFMArguments.getAlbum(
      this.ctx,
      senderRequestable
    );

    const [artistInfo, albumInfo] = await Promise.all([
      this.lastFMService.artistInfo(this.ctx, {
        artist,
        username: requestable,
      }),
      this.lastFMService.albumInfo(this.ctx, {
        artist,
        album,
        username: requestable,
      }),
    ]);

    const embed = this.minimalEmbed().setDescription(
      `${perspective.upper.possessive} ${displayNumber(
        albumInfo.userPlaycount,
        "play"
      )} of ${italic(albumInfo.name)} represent ${bold(
        calculatePercent(albumInfo.userPlaycount, artistInfo.userPlaycount)
      )}% of ${perspective.possessivePronoun} ${bold(
        artistInfo.name
      )} scrobbles.`
    );

    await this.reply(embed);
  }
}
