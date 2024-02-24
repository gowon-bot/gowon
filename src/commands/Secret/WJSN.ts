import { Command } from "../../lib/command/Command";

export default class WJSN extends Command {
  idSeed = "clc yujin";

  subcategory = "fun";
  description = "The only good wjsn song";
  secretCommand = true;

  async run() {
    await this.reply(
      "smaller😳smaller 😳small 😅and bigger😏 bié kàn 😃wô xiâo 💦bié kàn😃 wô xiâo ⁉️dào kêyî👀 fàng kâ bāo 😈"
    );
  }
}
