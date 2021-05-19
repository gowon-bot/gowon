import { DiscordIDMention } from "../../lib/arguments/mentions/DiscordIDMention";
import { BaseCommand } from "../../lib/command/BaseCommand";
import { LastFMConverter } from "../../services/LastFM/Converter/LastFMConverter";

const args = {
  inputs: {},
  mentions: {
    id: { index: 0, mention: new DiscordIDMention() },
  },
  flags: {},
} as const;

export default class Test extends BaseCommand<typeof args> {
  idSeed = "clc seunghee";

  description = "Testing testing 123";
  secretCommand = true;

  arguments = args;

  converter = new LastFMConverter(this.logger);

  async run() {
    // await this.send("Hello, world!");

    const artistInfo = await this.converter.artistInfo({
      artist: "sokodomo",
    });

    console.log(artistInfo);

    this.stopTyping();
  }
}
