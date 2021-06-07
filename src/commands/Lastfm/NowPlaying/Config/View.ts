import { Arguments } from "../../../../lib/arguments/arguments";
import { NowPlayingConfigChildCommand } from "./NowPlayingConfigChildCommand";

const args = {
  inputs: {},
} as const;

export class View extends NowPlayingConfigChildCommand<typeof args> {
  idSeed = "weeekly jaehee";

  description = "View your current config";
  usage = [""];

  arguments: Arguments = args;

  async run() {
    const { senderUser } = await this.parseMentions({
      senderRequired: true,
    });

    const config = await this.configService.getConfigForUser(senderUser!);

    const embed = this.newEmbed()
      .setAuthor(...this.generateEmbedAuthor("Config view"))
      .setFooter(`See ${this.prefix}npc help for more info`);

    if (config.length) {
      embed.setDescription(config.map((c) => c.code()).join(", "));
    } else {
      embed.setDescription("Empty config (your footer will be blank)");
    }

    await this.send(embed);
  }
}
