import { BaseCommand } from "../../lib/command/BaseCommand";

export default class WJSN extends BaseCommand {
  idSeed = "clc yujin";

  subcategory = "fun";
  description = "The only good wjsn song";
  secretCommand = true;

  async run() {
    await this.send(
      "smaller😳smaller 😳small 😅and bigger😏 bié kàn 😃wô xiâo 💦bié kàn😃 wô xiâo ⁉️dào kêyî👀 fàng kâ bāo 😈"
    );
  }
}
