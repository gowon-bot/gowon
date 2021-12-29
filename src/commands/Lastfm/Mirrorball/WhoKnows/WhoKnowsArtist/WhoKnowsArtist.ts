import { MirrorballError } from "../../../../../errors";
import { LinkGenerator } from "../../../../../helpers/lastFM";
import { Arguments } from "../../../../../lib/arguments/arguments";
import { FLAGS } from "../../../../../lib/arguments/flags";
import { Variation } from "../../../../../lib/command/BaseCommand";
import { VARIATIONS } from "../../../../../lib/command/variations";
import { LineConsolidator } from "../../../../../lib/LineConsolidator";
import {
  displayLink,
  displayNumber,
  displayNumberedList,
} from "../../../../../lib/views/displays";
import { CrownsService } from "../../../../../services/dbservices/CrownsService";
import { ServiceRegistry } from "../../../../../services/ServicesRegistry";
import { WhoKnowsBaseCommand } from "../WhoKnowsBaseCommand";
import {
  WhoKnowsArtistConnector,
  WhoKnowsArtistParams,
  WhoKnowsArtistResponse,
} from "./WhoKnowsArtist.connector";

const args = {
  inputs: {
    artist: { index: { start: 0 } },
  },
  flags: {
    noRedirect: FLAGS.noRedirect,
  },
} as const;

export default class WhoKnowsArtist extends WhoKnowsBaseCommand<
  WhoKnowsArtistResponse,
  WhoKnowsArtistParams,
  typeof args
> {
  connector = new WhoKnowsArtistConnector();

  idSeed = "bvndit songhee";

  aliases = ["wk", "fmwk"];

  variations: Variation[] = [VARIATIONS.update("wk"), VARIATIONS.global("wk")];

  description = "See who knows an artist";

  subcategory = "whoknows";

  arguments: Arguments = args;

  crownsService = ServiceRegistry.get(CrownsService);

  async run() {
    const { senderRequestable, senderUser, senderMirrorballUser } =
      await this.getMentions({
        senderRequired: !this.parsedArguments.artist,
        fetchMirrorballUser: true,
      });

    const artistName = await this.lastFMArguments.getArtist(
      this.ctx,
      senderRequestable,
      !this.parsedArguments.noRedirect
    );

    const crown = this.isGlobal()
      ? undefined
      : await this.crownsService.getCrown(this.ctx, artistName);

    if (this.variationWasUsed("update")) {
      await this.updateAndWait(this.author.id);
    }

    const guildID = this.isGlobal() ? undefined : this.guild.id;

    const response = await this.query({
      artist: { name: artistName },
      settings: {
        guildID,
        limit: 15,
      },
      serverID: guildID,
      user: { discordID: this.author.id },
    });

    const errors = this.parseErrors(response);

    if (errors) {
      throw new MirrorballError(errors.errors[0].message);
    }

    await this.cacheUserInfo(response.whoKnowsArtist.rows.map((u) => u.user));

    const { rows, artist } = response.whoKnowsArtist;
    const { rank, playcount } = response.artistRank;

    const lineConsolidator = new LineConsolidator();

    lineConsolidator.addLines(
      {
        shouldDisplay: !artist || rows.length === 0,
        string: "No one knows this artist",
      },
      {
        shouldDisplay: artist && rows.length !== 0,
        string: displayNumberedList(
          rows.map(
            (wk) =>
              `${this.displayUser(wk.user)} - **${displayNumber(
                wk.playcount,
                "**play"
              )}${crown?.user?.discordID === wk.user.discordID ? " 👑" : ""}`
          )
        ),
      },
      {
        shouldDisplay: rank > 15 && !!senderUser,
        string:
          `\n\`${rank}.\` ` +
          displayLink(
            this.message.member?.nickname || this.message.author.username,
            LinkGenerator.userPage(senderUser?.lastFMUsername!)
          ).strong() +
          `- **${displayNumber(playcount, "**play")}` +
          (crown?.user?.discordID === this.author.id ? " 👑" : ""),
      }
    );

    const embed = this.whoKnowsEmbed()
      .setTitle(
        `Who knows ${artist.name.strong()}${
          this.isGlobal() ? " globally" : ""
        }?`
      )
      .setDescription(lineConsolidator.consolidate())
      .setFooter(this.footerHelp(senderUser, senderMirrorballUser));

    await this.send(embed);
  }
}
