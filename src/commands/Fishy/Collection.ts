import { standardMentions } from "../../lib/context/arguments/mentionTypes/mentions";
import { ArgumentsMap } from "../../lib/context/arguments/types";
import { displayNumberedList } from "../../lib/views/displays";
import { SimpleScrollingEmbed } from "../../lib/views/embeds/SimpleScrollingEmbed";
import { displayFishyCollectionProgress } from "../../lib/views/fishy";
import { Fishy } from "../../services/fishy/Fishy";
import { findFishy, fishyList } from "../../services/fishy/fishyList";
import { FishyChildCommand } from "./FishyChildCommand";

const args = {
  ...standardMentions,
} satisfies ArgumentsMap;

export class Collection extends FishyChildCommand<typeof args> {
  idSeed = "csr yuna";
  aliases = ["col", "completion", "com"];

  description =
    "Take a look at your fishy collection, and see what fishy you have yet to catch!";

  arguments = args;

  async run() {
    const { fishyProfile, discordUser } = await this.getMentions({
      fetchFishyProfile: true,
      fishyProfileRequired: true,
      fetchDiscordUser: true,
    });

    const perspective = this.usersService.discordPerspective(
      this.author,
      discordUser
    );

    const collection = await this.fishyService.getCollection(fishyProfile);
    const noHidden = fishyList.filter((f) => !f.hidden);
    const fishyDisplayList = [
      ...noHidden,
      ...(collection
        .map((c) => findFishy({ byID: c }))
        .filter((f) => f && f.hidden) as Fishy[]),
    ];

    const embed = this.authorEmbed()
      .setHeader("Fishy collection")
      .setTitle(`${perspective.upper.possessive} fishy collection`);

    const scrollingEmbed = new SimpleScrollingEmbed(this.ctx, embed, {
      items: fishyDisplayList,
      pageSize: 15,
      pageRenderer(items, { offset }) {
        return (
          `_${displayFishyCollectionProgress(
            collection
          )} fishy collected_\n\n` +
          displayNumberedList(
            items.map((f) => {
              const owned = collection.includes(f.id);

              return `${f.rarity.emoji.forLevel(f.requiredFishyLevel)} ${
                owned ? f.emoji : f.emojiSilhouette
              } ${owned ? f.name : "???"}`;
            }),
            offset
          )
        );
      },
      overrides: {
        itemName: "fishy to collect",
        itemNamePlural: "fishy to collect",
        totalItems: noHidden.length,
      },
    });

    await this.send(scrollingEmbed);
  }
}
