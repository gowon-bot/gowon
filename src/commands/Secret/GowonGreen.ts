import { code } from "../../helpers/discord";
import { Command } from "../../lib/command/Command";

export default class GowonGreen extends Command {
  idSeed = "sonamoo nahyun";

  subcategory = "fun";
  description =
    "해가 잠이 드는 그 순간 / 나도 모르게 그냥 기분 좋아져 / 별빛도 참 예쁘니까";
  secretCommand = true;

  async run() {
    await this.reply(code("Gowon green is dead."));
  }
}
