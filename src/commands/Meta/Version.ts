import { code } from "../../helpers/discord";
import { Command } from "../../lib/command/Command";
import { Emoji } from "../../lib/emoji/Emoji";
import { ServiceRegistry } from "../../services/ServicesRegistry";
import { LilacAPIService } from "../../services/lilac/LilacAPIService";

export default class Version extends Command {
  idSeed = "newjeans haerin";

  description = "See what versions of Gowon services are running";
  category = "meta";
  usage = "";
  aliases = ["versions"];

  lilacAPIService = ServiceRegistry.get(LilacAPIService);

  async run() {
    const { version: lilacVersion } = await this.lilacAPIService.getVersion(
      this.ctx
    );

    const embed = this.minimalEmbed().setTitle("Gowon versions:")
      .setDescription(`
${Emoji.gowonLogo} Gowon: ${code(this.gowonService.getCommitHash())}
${Emoji.lilacLogo} Lilac: ${code(lilacVersion)}
`);

    await this.reply(embed);
  }
}
