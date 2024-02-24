import { Command } from "../../lib/command/Command";
import { displayLink, displayUserTag } from "../../lib/ui/displays";

export default class Github extends Command {
  idSeed = "apink chorom";

  subcategory = "about";
  aliases = ["gh", "source"];
  description = "Displays the github link for the bot";

  async run() {
    const author = await this.gowonClient.client.users.fetch(
      this.gowonClient.specialUsers.developers[0].id
    );

    const embed = this.minimalEmbed()
      .setTitle("Gowon's source code </>")
      .setDescription(
        `You can find the bot repo at ${displayLink(
          "gowon-bot/gowon",
          "https://github.com/gowon-bot/gowon"
        )}, the indexing repo at ${displayLink(
          "gowon-bot/lilac",
          "https://github.com/gowon-bot/lilac"
        )}, and the website repo at ${displayLink(
          "jivison/gowon.ca",
          "https://github.com/gowon-bot/gowon.ca"
        )}
      
The bot is written in Typescript with Discord.js, Lilac is written in Elixir serving a GraphQL api, and Gowon.bot is built with Typescript and React.`
      )
      .setFooter(`Made with <3 by ${displayUserTag(author)}`)
      .setFooterIcon(
        (
          await this.gowonClient.client.users.fetch("267794154459889664")
        ).avatarURL({ dynamic: true }) ?? undefined
      );

    await this.reply(embed);
  }
}
