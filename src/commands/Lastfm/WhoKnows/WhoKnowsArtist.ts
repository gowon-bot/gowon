import { bold } from "../../../helpers/discord";
import { LastfmLinks } from "../../../helpers/lastfm/LastfmLinks";
import { Variation } from "../../../lib/command/Command";
import { VARIATIONS } from "../../../lib/command/variations";
import {
  prefabArguments,
  prefabFlags,
} from "../../../lib/context/arguments/prefabArguments";
import { ArgumentsMap } from "../../../lib/context/arguments/types";
import { Emoji } from "../../../lib/emoji/Emoji";
import { LineConsolidator } from "../../../lib/LineConsolidator";
import { TagConsolidator } from "../../../lib/tags/TagConsolidator";
import {
  displayLink,
  displayNumber,
  displayNumberedList,
} from "../../../lib/ui/displays";
import { CrownsService } from "../../../services/dbservices/crowns/CrownsService";
import { RedirectsService } from "../../../services/dbservices/RedirectsService";
import { ServiceRegistry } from "../../../services/ServicesRegistry";
import { WhoKnowsBaseCommand } from "./LilacWhoKnowsBaseCommand";

const args = {
  ...prefabArguments.artist,
  noRedirect: prefabFlags.noRedirect,
} satisfies ArgumentsMap;

export default class WhoKnowsArtist extends WhoKnowsBaseCommand<typeof args> {
  idSeed = "bvndit songhee";
  description = "Shows who has scrobbled an artist in a server";
  subcategory = "whoknows";
  aliases = ["wk", "fmwk", "whoknows"];

  variations: Variation[] = [VARIATIONS.global("wk")];

  slashCommand = true;

  arguments = args;

  crownsService = ServiceRegistry.get(CrownsService);
  redirectsService = ServiceRegistry.get(RedirectsService);

  async run() {
    const { senderRequestable, senderUser, senderLilacUser } =
      await this.getMentions({
        senderRequired: !this.parsedArguments.artist,
        fetchLilacUser: true,
      });

    const artistName = await this.lastFMArguments.getArtist(
      this.ctx,
      senderRequestable,
      { redirect: !this.parsedArguments.noRedirect }
    );

    const artistTags = await this.lilacTagsService.getTagsForArtists(this.ctx, [
      { name: artistName },
    ]);

    const tagConsolidator = new TagConsolidator();
    tagConsolidator.addTags(this.ctx, artistTags);

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

    await Promise.all([
      this.cacheUserInfo(whoKnows.rows.map((u) => u.user)),
      tagConsolidator.saveServerBannedTagsInContext(this.ctx),
    ]);

    const redirectHelp = await this.redirectsService.artistRedirectReminder(
      this.ctx,
      this.parsedArguments.artist
    );

    const { rows, artist } = whoKnows;
    const { rank, playcount } = whoKnowsRank;

    const description = new LineConsolidator().addLines(
      {
        shouldDisplay: !artist || rows.length === 0,
        string: "No one knows this artist",
      },
      {
        shouldDisplay: rows.length === 0 && !!redirectHelp,
        string: "\n" + redirectHelp,
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
              LastfmLinks.userPage(senderUser?.lastFMUsername!)
            )
          ) +
          `- **${displayNumber(playcount, "**play")}` +
          (crown?.user?.discordID === this.author.id ? " 👑" : ""),
      },
      {
        shouldDisplay: tagConsolidator.hasAnyTags(),
        string: `\n-# ${tagConsolidator
          .consolidateAsStrings(10)
          .join(TagConsolidator.tagJoin)}`,
      }
    );

    const embed = this.minimalEmbed()
      .setTitle(
        `${Emoji.usesIndexedDataTitle} Who knows ${bold(artist.name)} ${
          this.isGlobal() ? "globally" : `in ${this.requiredGuild.name}`
        }?`
      )
      .setDescription(description)
      .setFooter(
        (
          `${displayNumber(
            whoKnowsRank.totalListeners,
            this.isGlobal() ? "global listener" : "server listener"
          )}\n` + this.footerHelp(senderLilacUser)
        ).trim()
      )
      .setFooterIcon(
        this.isGlobal() ? this.gowonIconURL : this.guild?.iconURL() ?? undefined
      );

    await this.reply(embed);
  }
}
