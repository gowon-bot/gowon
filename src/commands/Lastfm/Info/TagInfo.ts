import { EmbedField } from "discord.js";
import { TagNotAllowedError } from "../../../errors/errors";
import { bold } from "../../../helpers/discord";
import { LastfmLinks } from "../../../helpers/lastfm/LastfmLinks";
import {
  bullet,
  emDash,
  extraWideSpace,
} from "../../../helpers/specialCharacters";
import { StringArgument } from "../../../lib/context/arguments/argumentTypes/StringArgument";
import { ArgumentsMap } from "../../../lib/context/arguments/types";
import { Emoji } from "../../../lib/Emoji";
import { LineConsolidator } from "../../../lib/LineConsolidator";
import { displayLink, displayNumber } from "../../../lib/views/displays";
import { LilacArtistsService } from "../../../services/lilac/LilacArtistsService";
import { LilacTagsService } from "../../../services/lilac/LilacTagsService";
import { ServiceRegistry } from "../../../services/ServicesRegistry";
import { WordBlacklistService } from "../../../services/WordBlacklistService";
import { InfoCommand } from "./InfoCommand";

const args = {
  tag: new StringArgument({
    index: { start: 0 },
    required: true,
    description: "The name of the tag to lookup",
  }),
} satisfies ArgumentsMap;

export default class TagInfo extends InfoCommand<typeof args> {
  idSeed = "csvc park moonchi";
  shouldBeIndexed = true;

  aliases = ["tai", "gi"];
  description = "Displays some information about a tag";
  usage = ["tag"];

  slashCommand = true;

  arguments = args;

  lilacTagsService = ServiceRegistry.get(LilacTagsService);
  lilacArtistsService = ServiceRegistry.get(LilacArtistsService);
  wordBlacklistService = ServiceRegistry.get(WordBlacklistService);

  async run() {
    const tag = this.parsedArguments.tag;

    await this.wordBlacklistService.saveServerBannedTagsInContext(this.ctx);

    if (
      this.settingsService.get("strictTagBans", {
        guildID: this.requiredGuild.id,
      }) &&
      !this.wordBlacklistService.isAllowed(this.ctx, tag, ["tags"])
    ) {
      throw new TagNotAllowedError();
    }

    const [tagInfo, tagList, tagTopArtists, lilacArtists, userTopArtists] =
      await Promise.all([
        this.lastFMService.tagInfo(this.ctx, { tag }),
        this.lilacTagsService.list(this.ctx, { inputs: [{ name: tag }] }),
        this.lastFMService.tagTopArtists(this.ctx, { tag, limit: 1000 }),
        this.lilacArtistsService.list(this.ctx, { tags: [{ name: tag }] }),
        this.lilacArtistsService.listCounts(this.ctx, {
          tags: [{ name: tag }],
          users: [{ discordID: this.author.id }],
          pagination: { perPage: 5, page: 1 },
        }),
      ]);

    const similarTags = tagList.tags.filter(
      (t) => t.name.toLowerCase() != tag.toLowerCase()
    );

    if (tagInfo.uses === 0) {
      const lineConsolidator = new LineConsolidator().addLines(
        `${bold(tag)} doesn't appear to be a registered tag on Last.fm`,
        {
          string: `\nDid you mean...\n${similarTags
            .map(
              (t) =>
                `${extraWideSpace}- ${displayLink(
                  t.name.toLowerCase(),
                  LastfmLinks.tagPage(t.name)
                )}`
            )
            .join("\n")}`,
          shouldDisplay: similarTags.length > 0,
        }
      );

      const embed = this.newEmbed()
        .setAuthor(this.generateEmbedAuthor("Tag info"))
        .setDescription(lineConsolidator.consolidate());

      await this.send(embed);
    } else {
      const summary = this.scrubReadMore(tagInfo.wiki.summary);

      const taggedArtistCount = new Set([
        ...lilacArtists.artists.map((a) => a.name.toLowerCase()),
        ...tagTopArtists.artists.map((a) => a.name.toLowerCase()),
      ]).size;

      const globalStatsConsolidator = new LineConsolidator().addLines(
        {
          title: "Listeners",
          value: displayNumber(tagInfo.listeners),
        },
        {
          title: "Uses",
          value: displayNumber(tagInfo.uses),
        },
        {
          title: "Tagged artists",
          value: `${
            taggedArtistCount >= 1000
              ? `${displayNumber(taggedArtistCount)}+`
              : displayNumber(taggedArtistCount)
          }`,
        },
        {
          shouldDisplay: similarTags.length > 0,
          string: {
            title: "Similar tags",
            value: similarTags
              .map((t) =>
                displayLink(t.name.toLowerCase(), LastfmLinks.tagPage(t.name))
              )
              .join(", "),
          },
        }
      );

      const personalStatsConsolidator = new LineConsolidator().addLines(
        {
          shouldDisplay: userTopArtists.artistCounts.length > 0,
          string: {
            title: "Matching artists",
            value: displayNumber(userTopArtists.pagination.totalItems),
          },
        },
        {
          shouldDisplay: userTopArtists.artistCounts.length > 0,
          string: {
            title: "Top artists",
            value:
              "\n" +
              userTopArtists.artistCounts
                .map(
                  (ac) =>
                    `${extraWideSpace}${bullet} ${
                      ac.artist.name
                    } ${emDash} _${displayNumber(ac.playcount, "play")}_`
                )
                .join("\n"),
          },
        }
      );

      const embedFields: EmbedField[] = [
        {
          name: "Global stats",
          inline: true,
          value: globalStatsConsolidator.consolidate(),
        },
      ];

      if (userTopArtists.artistCounts.length > 0) {
        embedFields.push({
          name: `${Emoji.usesIndexedDataDescription} Your stats`,
          inline: true,
          value: personalStatsConsolidator.consolidate(),
        });
      }

      const embed = this.newEmbed()
        .setAuthor(this.generateEmbedAuthor("Tag info"))
        .setTitle(tagInfo.name)
        .setURL(this.getLinkFromBio(tagInfo.wiki.summary) || "")
        .setDescription(summary ? summary + "\n" : "_(no description)_")
        .addFields(...embedFields);

      this.send(embed);
    }
  }
}
