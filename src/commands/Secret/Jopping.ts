import { BaseCommand } from "../../lib/command/BaseCommand";
import { Emoji } from "../../lib/Emoji";

export default class Jopping extends BaseCommand {
  aliases = ["markleeoppa"];
  description = Emoji.joppinh;
  secretCommand = true;

  async run() {
    await this.send(
      `😍 Uh, you think 🔍 ya big boy 👨‍🦲 throwing 🥊 three 3️⃣ stacks Imma show 🔥 you how 💢 to ball 🎱 you a mismatch 👎🏻. Opinionated 💥 but im always ✅ spitting straight ➖ facts. Throw it back 🔙 I might throw this on an8️⃣ track⚡️`
    );
  }
}
