import { generateLink } from "../../helpers/discord";
import { BaseCommand } from "../../lib/command/BaseCommand";

export default class Github extends BaseCommand {
  idSeed = "apink chorom";

  aliases = ["gh"];
  secretCommand = true;
  description = "Displays the github link for the bot";

  async run() {
    const embed = this.newEmbed()
      .setTitle("Gowon's source code </>")
      .setDescription(
        `You can find the bot repo at ${generateLink(
          "jivison/gowon",
          "https://github.com/jivison/gowon"
        )} and the indexing repo at ${generateLink(
          "jivison/gowon-indexer",
          "https://github.com/jivison/gowon-indexer"
        )}
      
The bot is written in Typescript with Discord.js, and the indexer is written in Go serving a GraphQL api; both use Postgres as a database.`
      )
      .setFooter(
        "Made with <3 by John🥳#2527",
        (
          await this.gowonClient.client.users.fetch("267794154459889664")
        ).avatarURL({ dynamic: true }) ?? undefined
      );

    await this.send(embed);
  }
}
