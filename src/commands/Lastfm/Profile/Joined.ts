import { ProfileChildCommand } from "./ProfileChildCommand";

export class Joined extends ProfileChildCommand {
  idSeed = "snsd yuri";

  aliases = ["j", "join"];
  description = "Shows when a user joined Last.fm";

  slashCommand = true;

  async run() {
    const { perspective } = await this.getMentions();

    const joined = await this.calculator.joined();

    const embed = this.profileEmbed()
      .setDescription(
        `${perspective.upper.plusToHave} scrobbling since ${joined}`
      )
      .setFooter("");

    await this.reply(embed);
  }
}
