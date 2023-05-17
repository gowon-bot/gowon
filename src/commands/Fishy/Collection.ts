import { standardMentions } from "../../lib/context/arguments/mentionTypes/mentions";
import { ArgumentsMap } from "../../lib/context/arguments/types";
import { displayNumber, displayNumberedList } from "../../lib/views/displays";
import { SimpleScrollingEmbed } from "../../lib/views/embeds/SimpleScrollingEmbed";
import { Fishy } from "../../services/fishy/classes/Fishy";
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

    const embed = this.newEmbed()
      .setAuthor(this.generateEmbedAuthor("Fishy collection"))
      .setTitle(`${perspective.upper.possessive} fishy collection`);

    const scrollingEmbed = new SimpleScrollingEmbed(this.ctx, embed, {
      items: fishyDisplayList,
      pageSize: 15,
      pageRenderer(items, { offset }) {
        return (
          `_${displayNumber(collection.length)} of ${
            noHidden.length
          } fishy collected_\n\n` +
          displayNumberedList(
            items.map((f) => {
              const owned = collection.includes(f.id);

              return `${f.rarity.emoji} ${
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

    scrollingEmbed.send();
  }
}
