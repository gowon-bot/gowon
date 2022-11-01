import { bold } from "../../../helpers/discord";
import { LinkGenerator } from "../../../helpers/lastFM";
import { Variation } from "../../../lib/command/Command";
import { VARIATIONS } from "../../../lib/command/variations";
import {
  prefabArguments,
  prefabFlags,
} from "../../../lib/context/arguments/prefabArguments";
import { Emoji } from "../../../lib/Emoji";
import { LineConsolidator } from "../../../lib/LineConsolidator";
import {
  displayLink,
  displayNumber,
  displayNumberedList,
} from "../../../lib/views/displays";
import { CrownsService } from "../../../services/dbservices/CrownsService";
import { ServiceRegistry } from "../../../services/ServicesRegistry";
import { WhoKnowsBaseCommand } from "./LilacWhoKnowsBaseCommand";

const args = {
  ...prefabArguments.artist,
  noRedirect: prefabFlags.noRedirect,
} as const;

export default class WhoKnowsArtist extends WhoKnowsBaseCommand<typeof args> {
  idSeed = "bvndit songhee";
  description = "Shows who has scrobbled an artist in a server";
  subcategory = "whoknows";
  aliases = ["wk", "fmwk", "whoknows"];
  guildRequired = true;

  variations: Variation[] = [VARIATIONS.global("wk")];

  slashCommand = true;

  arguments = args;

  crownsService = ServiceRegistry.get(CrownsService);

  async run() {
    const { senderRequestable, senderUser } = await this.getMentions({
      senderRequired: !this.parsedArguments.artist,
    });

    const senderLilacUser = await this.lilacUsersService.fetchUser(this.ctx, {
      discordID: this.author.id,
    });

    const artistName = await this.lastFMArguments.getArtist(
      this.ctx,
      senderRequestable,
      { redirect: !this.parsedArguments.noRedirect }
    );

    const crown = this.isGlobal()
      ? undefined
      : await this.crownsService.getCrown(this.ctx, artistName);

    const guildID = this.isGlobal() ? undefined : this.requiredGuild.id;

    const { whoKnowsArtist: whoKnows, whoKnowsArtistRank: whoKnowsRank } =
      await this.lilacWhoKnowsService.whoKnowsArtist(
        this.ctx,
        artistName,
        this.author.id,
        guildID
      );

    await this.cacheUserInfo(whoKnows.rows.map((u) => u.user));

    const { rows, artist } = whoKnows;
    const { rank, playcount } = whoKnowsRank;

    const lineConsolidator = new LineConsolidator();

    lineConsolidator.addLines(
      {
        shouldDisplay: !artist || rows.length === 0,
        string: "No one knows this artist",
      },
      {
        shouldDisplay: artist && rows.length !== 0,
        string: displayNumberedList(
          rows
            .slice(0, 15)
            .map(
              (wk) =>
                `${this.whoKnowsService.displayUser(
                  this.ctx,
                  wk.user
                )} - **${displayNumber(wk.playcount, "**play")}${
                  crown?.user?.discordID === wk.user.discordID ? " 👑" : ""
                }`
            )
        ),
      },
      {
        shouldDisplay: rank > 15 && !!senderUser,
        string:
          `\n\`${rank}.\` ` +
          bold(
            displayLink(
              this.payload.member?.nickname || this.payload.author.username,
              LinkGenerator.userPage(senderUser?.lastFMUsername!)
            )
          ) +
          `- **${displayNumber(playcount, "**play")}` +
          (crown?.user?.discordID === this.author.id ? " 👑" : ""),
      }
    );

    const embed = this.newEmbed()
      .setAuthor(this.generateEmbedAuthor("Who knows artist"))
      .setTitle(
        `${Emoji.usesIndexedData} Who knows ${bold(artist.name)} ${
          this.isGlobal() ? "globally" : `in ${this.requiredGuild.name}`
        }?`
      )
      .setDescription(lineConsolidator.consolidate())
      .setFooter({
        text: (
          `${displayNumber(
            rows.length,
            this.isGlobal() ? "global listener" : "server listener"
          )}\n` + this.footerHelp(senderLilacUser)
        ).trim(),
        iconURL: this.isGlobal()
          ? this.gowonIconURL
          : this.guild?.iconURL() ?? undefined,
      });

    await this.send(embed);
  }
}
