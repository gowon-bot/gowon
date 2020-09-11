import { LogicError } from "../../errors";
import { dateTimeDisplay } from "../../helpers";
import { Arguments } from "../../lib/arguments/arguments";
import { BaseCommand } from "../../lib/command/BaseCommand";
import { GithubService } from "../../services/Github/GithubService";

export default class Feedback extends BaseCommand {
  description = "Send feedback to the john (the gowon author)";
  secretCommand = true;
  usage = ["title | body"];

  arguments: Arguments = {
    inputs: {
      title: { index: 0, splitOn: "|" },
      body: { index: { start: 1 }, splitOn: "|" },
    },
  };

  githubService = new GithubService(this.logger);

  async run() {
    let title = this.parsedArguments.title as string,
      body = this.parsedArguments.body as string;

    if (!title || !body)
      throw new LogicError("please specify a title and a body!");

    let metadata = `


## Notes from Gowon:

**Author**: ${this.author.username} (${
      this.message.member?.nickname || "*No Nickname*"
    })
**Ran at**: ${dateTimeDisplay(new Date())}
**Channel:pok c** \\#${
      this.message.guild?.channels.cache.find(
        (c) => c.id === this.message.channel.id
      )?.name
    }
**Guild**: ${this.guild.name}`;

    let issue = await this.githubService.createIssue({
      title,
      body: body + metadata,
      labels: ["user feedback"],
    });

    if (issue.id) {
      await this.send(
        `Feedback sent! You can view it and add comments here: ${issue.html_url}`
      );
    } else {
      await this.send(
        "There was an issue submitting feedback, you can dm the author at John🥳#2527"
      );
    }
  }
}
