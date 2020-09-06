import { LogicError } from "../../../errors";
import { Arguments } from "../../../lib/arguments/arguments";
import { CrownsChildCommand } from "./CrownsChildCommand";

export default class MarkBootleg extends CrownsChildCommand {
  aliases = ["bootleg", "mb"];
  description = "Marks a crown as a bootleg of another crown";
  usage = ["artistName | real artistName"];

  arguments: Arguments = {
    inputs: {
      bootlegName: { index: 0, splitOn: "|" },
      artistName: { index: 1, splitOn: "|" },
    },
  };

  async run() {
    let bootlegName = this.parsedArguments.bootlegName as string,
      artistName = this.parsedArguments.artistName as string;

    let [artist, bootlegArtist] = await Promise.all([
      this.lastFMService.correctArtist({ artist: artistName }),
      this.lastFMService.correctArtist({ artist: bootlegName }),
    ]);

    let crown = await this.crownsService.getCrown(artist, this.guild.id, {
      noRedirect: true,
    });

    if (!crown)
      throw new LogicError(`a crown for ${artist.bold()} doesn't exist!`);

    if (artist === bootlegArtist)
      throw new LogicError(`can't mark a crown as a duplicate of itself!`);

    await this.crownsService.scribe.bootleg(
      bootlegArtist,
      this.guild.id,
      this.author,
      artist
    );
    await this.crownsService.markAsBootleg(crown, bootlegArtist);

    await this.send(
      `Marked ${bootlegArtist.bold()} as a bootleg of ${artist.bold()}`
    );
  }
}
