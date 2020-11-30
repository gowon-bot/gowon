import { Job } from "bull";
import { numberDisplay } from "../../helpers";
import { BaseCommand } from "../../lib/command/BaseCommand";
import { JobService, LFMIndexProgress } from "../../services/JobService";
import { LastFMService } from "../../services/LastFM/LastFMService";

export default class Test extends BaseCommand {
  description = "Testing testing 123";
  secretCommand = true;
  devCommand = true;

  jobService = new JobService();
  lastfmservice = new LastFMService();

  async run() {
    let sentMessage = await this.send("Caching your scrobbles...");

    this.jobService.indexLFMUser(
      "flushed_emoji",
      async () => {
        sentMessage.edit("~~Caching your scrobbles...~~ Complete!");
        await this.reply("index completed!");
      },
      (_: Job, progress: LFMIndexProgress) => {
        if (progress.current === 1 || progress.current % 3 === 0) {
          sentMessage.edit(
            `Caching your scrobbles... (${numberDisplay(
              progress.current
            )} / ${numberDisplay(progress.total)} pages complete)`
          );
        }
      }
    );
  }
}
