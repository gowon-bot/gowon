import { Arguments } from "../../../lib/arguments/arguments";
import { CrownsChildCommand } from "./CrownsChildCommand";

export class UnmarkBootleg extends CrownsChildCommand {
  aliases = ["unbootleg", "umb"];
  description = "Unmarks a crown as a bootleg of another crown";
  usage = ["bootleg"];

  arguments: Arguments = {
    inputs: {
      bootlegName: { index: { start: 0 } },
    },
  };

  async run() {
    let bootlegName = this.parsedArguments.bootlegName as string;

    let bootlegArtist = await this.lastFMService.correctArtist({
      artist: bootlegName,
    });

    let bootleg = await this.crownsService.findBootleg(
      bootlegArtist,
      this.guild.id
    );

    await this.crownsService.scribe.unbootleg(bootleg!, this.author);
    await this.crownsService.unmarkBootleg(bootleg);

    await this.send(
      `Unmarked ${bootlegArtist.bold()} as a bootleg of ${bootleg!.crown.artistName.bold()}`
    );
  }
}
