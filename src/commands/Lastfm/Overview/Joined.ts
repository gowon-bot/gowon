import { OverviewChildCommand } from "./OverviewChildCommand";

export class Joined extends OverviewChildCommand {
  idSeed = "snsd yuri";

  aliases = ["j", "join"];
  description = "Shows when a user joined Last.fm";

  async run() {
    let joined = await this.calculator.joined();

    let embed = (await this.overviewEmbed()).setDescription(
      `Scrobbling since ${joined}`
    );

    await this.send(embed);
  }
}
