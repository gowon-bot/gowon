import { OverviewChildCommand } from "./OverviewChildCommand";
import { Message, MessageEmbed } from "discord.js";

export class Playsover extends OverviewChildCommand {
  aliases = ["po"];
  description = "Shows some playsover stats";

  async run(message: Message) {
    let { username, perspective } = await this.parseMentionedUsername(message);

    let { badge, colour, image } = await this.getAuthorDetails();
    let [thousand, fivehundred, twofifty, hundred, fifty] = await Promise.all([
      this.calculator.playsOver(1000),
      this.calculator.playsOver(500),
      this.calculator.playsOver(250),
      this.calculator.playsOver(100),
      this.calculator.playsOver(50),
    ]);

    let embed = new MessageEmbed()
      .setAuthor(username + badge, image)
      .setColor(colour).setDescription(`Among ${
      perspective.possesivePronoun
    } top 1000 artists, ${perspective.plusToHave}...
  - ${thousand.bold()} artists with 1000+ scrobbles
  - ${fivehundred.bold()} artists with 500+ scrobbles
  - ${twofifty.bold()} artists with 250+ scrobbles
  - ${hundred.bold()} artists with 100+ scrobbles
  - ${fifty.bold()} artists with 50+ scrobbles`);

    await message.channel.send(embed);
  }
}
