import { parseJSON } from "date-fns";
import { ago } from "../../helpers";
import { BaseCommand } from "../../lib/command/BaseCommand";
import { GithubService } from "../../services/Github/GithubService";

export default class LatestCommit extends BaseCommand {
  aliases = ["whatsnew"];
  secretCommand = true;
  description = "Displays the most recent commit to the Gowon repository";

  githubService = new GithubService(this.logger);

  async run() {
    let branch = await this.githubService.getBranch("lfm-server-changes");

    let committedAt = parseJSON(branch.commit.commit.author.date);

    let embed = this.newEmbed()
      .setTitle(
        `Latest commit to ${this.githubService.owner}/${this.githubService.repo} @ ${branch.name}`
      )
      .setURL(branch._links.html).setDescription(`
      _Last commited to ${ago(committedAt!)} by ${
      branch.commit.commit.author.name
    }_
        
      "${branch.commit.commit.message}"
      `);

    await this.send(embed);
  }
}
