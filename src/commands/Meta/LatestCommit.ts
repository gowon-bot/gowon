import { parseJSON } from "date-fns";
import { ago } from "../../helpers";
import { Command } from "../../lib/command/Command";
import { GithubService } from "../../services/Github/GithubService";
import { ServiceRegistry } from "../../services/ServicesRegistry";

export default class LatestCommit extends Command {
  idSeed = "apink naeun";

  aliases = ["whatsnew"];
  subcategory = "developer";
  secretCommand = true;
  description = "Displays the most recent commit to the Gowon repository";

  githubService = ServiceRegistry.get(GithubService);

  async run() {
    let branch = await this.githubService.getBranch(
      this.ctx,
      "lfm-server-changes"
    );

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
