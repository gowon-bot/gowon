import { standardMentions } from "../../lib/context/arguments/mentionTypes/mentions";
import { ArgumentsMap } from "../../lib/context/arguments/types";
import { displayNumberedList } from "../../lib/views/displays";
import { SimpleScrollingEmbed } from "../../lib/views/embeds/SimpleScrollingEmbed";
import { fishyList } from "../../services/fishy/fishyList";
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
    const { fishyProfile } = await this.getMentions({
      fetchFishyProfile: true,
      fishyProfileRequired: true,
    });

    const collection = await this.fishyService.getCollection(fishyProfile);

    const embed = this.newEmbed().setAuthor(
      this.generateEmbedAuthor("Fishy collection")
    );

    const scrollingEmbed = new SimpleScrollingEmbed(this.ctx, embed, {
      items: fishyList,
      pageSize: 15,
      pageRenderer(items, { offset }) {
        return displayNumberedList(
          items.map((f) => {
            const owned = collection.includes(f.id);

            return `${f.rarity.emoji} ${owned ? f.emoji : f.emojiSilhouette} ${
              owned ? f.name : "???"
            }`;
          }, offset)
        );
      },
      overrides: { itemName: "fishy", itemNamePlural: "fishy" },
    });

    scrollingEmbed.send();
  }
}
