import { Command } from "../../lib/command/Command";
import { Emoji } from "../../lib/Emoji";

export default class Vote extends Command {
  idSeed = "hot issue yebin";

  subcategory = "about";
  description = "Vote for Gowon on top.gg!";
  aliases = ["topgg"];

  async run() {
    const embed = this.newEmbed().setAuthor(this.generateEmbedAuthor("Vote"))
      .setDescription(`You can vote for Gowon at https://top.gg/bot/720135602669879386/vote
      
Thanks! ${Emoji.gowonheart}`);

    await this.send(embed);
  }
}
