import { BaseCommand } from "../../lib/command/BaseCommand";
import { NamedRangeParser } from "../../lib/timeAndDate/NamedRangeParser";
import { LastFMService } from "../../services/LastFM/LastFMService";
import { ServiceRegistry } from "../../services/ServicesRegistry";

const args = {
  inputs: { a: { custom: new NamedRangeParser() } },
  mentions: {},
  flags: {},
} as const;

export default class Test extends BaseCommand<typeof args> {
  idSeed = "clc seunghee";

  description = "Testing testing 123";
  secretCommand = true;
  subcategory = "developer";

  arguments = args;

  lastFMService = ServiceRegistry.get(LastFMService);

  async run() {
    const username = "flushed_emoji";
    const timeFrame = this.parsedArguments.a!;

    const response = await this.lastFMService._userGetWeeklyArtistChart(
      this.ctx,
      {
        username,
        ...timeFrame.asTimeframeParams,
      }
    );

    console.log(response);

    // await this.send("Hello, world!");
  }
}
