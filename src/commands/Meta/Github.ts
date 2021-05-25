import { BaseCommand } from "../../lib/command/BaseCommand";
import { displayLink } from "../../lib/views/displays";

export default class Github extends BaseCommand {
  idSeed = "apink chorom";

  subcategory = "about";
  aliases = ["gh", "source"];
  description = "Displays the github link for the bot";

  async run() {
    const author = await this.gowonClient.client.users.fetch(
      this.gowonClient.specialUsers.developers[0].id
    );

    const embed = this.newEmbed()
      .setTitle("Gowon's source code </>")
      .setDescription(
        `You can find the bot repo at ${displayLink(
          "jivison/gowon",
          "https://github.com/jivison/gowon"
        )} and the indexing repo at ${displayLink(
          "jivison/gowon-indexer",
          "https://github.com/jivison/gowon-indexer"
        )}
      
The bot is written in Typescript with Discord.js, and the indexer is written in Go serving a GraphQL api; both use Postgres as a database.`
      )
      .setFooter(
        `Made with <3 by ${author.tag}`,
        (
          await this.gowonClient.client.users.fetch("267794154459889664")
        ).avatarURL({ dynamic: true }) ?? undefined
      );

    await this.send(embed);
  }
}
