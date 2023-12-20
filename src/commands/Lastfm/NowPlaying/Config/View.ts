import { code } from "../../../../helpers/discord";
import { LineConsolidator } from "../../../../lib/LineConsolidator";
import { NowPlayingConfigChildCommand } from "./NowPlayingConfigChildCommand";

export class View extends NowPlayingConfigChildCommand {
  idSeed = "weeekly jaehee";

  description = "View your current config";
  usage = [""];

  slashCommand = true;

  async run() {
    const { senderUser } = await this.getMentions({
      senderRequired: true,
    });

    const config = await this.configService.getConfigNoUnused(
      this.ctx,
      senderUser!
    );

    const embed = this.authorEmbed()
      .setHeader("Config view")
      .setFooter(
        `This config only applies to your ${this.prefix}fmx calls\nSee ${this.prefix}npc help for more info`
      )
      .setDescription(
        new LineConsolidator().addLines({
          shouldDisplay: !!config.length,
          string: config.map((c) => code(c)).join(", "),
          else: "Empty config (your footer will be blank)",
        })
      );

    await this.send(embed);
  }
}
