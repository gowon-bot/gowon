import { ProfileChildCommand } from "./ProfileChildCommand";

export class Joined extends ProfileChildCommand {
  idSeed = "snsd yuri";

  aliases = ["j", "join"];
  description = "Shows when a user joined Last.fm";

  slashCommand = true;

  async run() {
    const joined = await this.calculator.joined();

    const embed = (await this.profileEmbed())
      .setHeader("Profile joined")
      .setDescription(`Scrobbling since ${joined}`);

    await this.send(embed);
  }
}
