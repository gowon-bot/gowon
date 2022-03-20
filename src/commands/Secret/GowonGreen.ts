import { code } from "../../helpers/discord";
import { BaseCommand } from "../../lib/command/BaseCommand";

export default class GowonGreen extends BaseCommand {
  idSeed = "sonamoo nahyun";

  subcategory = "fun";
  description =
    "해가 잠이 드는 그 순간 / 나도 모르게 그냥 기분 좋아져 / 별빛도 참 예쁘니까";
  secretCommand = true;

  async run() {
    await this.send(code("#02BCA1"));
  }
}
