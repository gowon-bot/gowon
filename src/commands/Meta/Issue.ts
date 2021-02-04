import { Message } from "discord.js";
import { dateTimeDisplay } from "../../helpers";
import { generateLink } from "../../helpers/discord";
import { Arguments } from "../../lib/arguments/arguments";
import { BaseCommand, Variation } from "../../lib/command/BaseCommand";
import { RunAs } from "../../lib/command/RunAs";
import { Validation } from "../../lib/validation/ValidationChecker";
import { validators } from "../../lib/validation/validators";
import { GithubService } from "../../services/Github/GithubService";

const args = {
  inputs: {
    title: { index: 0, splitOn: "|" },
    body: { index: { start: 1 }, splitOn: "|" },
  },
} as const;

export default class Issue extends BaseCommand<typeof args> {
  idSeed = "apink bomi";

  description = "Create a github issue on the gowon repository";
  secretCommand = true;
  usage = ["title | body"];
  devCommand = true;

  variations: Variation[] = [
    {
      variationString: "bug",
      description: "Add the bug label",
    },
    {
      variationRegex: /enhancement|feat|feature/,
      friendlyString: "enhancement`, `feat`,`feature",
      description: "Add the enhancement label",
    },
    {
      variationRegex: /documentation|doc/,
      friendlyString: "documentation`, `doc",
      description: "Add the documentation label",
    },
    {
      variationString: "spike",
      description: "Add the question label",
    },
  ];

  arguments: Arguments = args;

  validation: Validation = {
    title: new validators.Required({}),
  };

  githubService = new GithubService(this.logger);

  async run(_: Message, runAs: RunAs) {
    let title = this.parsedArguments.title!,
      body = this.parsedArguments.body;

    let metadata = `


## Notes from Gowon:

${generateLink("Jump to message", this.message.url)}

**Author**: ${this.author.username} (${
      this.message.member?.nickname || "*No Nickname*"
    })
**Ran at**: ${dateTimeDisplay(new Date())}
**Channel:** \\#${
      this.message.guild?.channels.cache.find(
        (c) => c.id === this.message.channel.id
      )?.name
    }
**Guild**: ${this.guild.name}`;

    const labels = ["user feedback"];

    if (runAs.variationWasUsed("bug")) labels.push("bug");
    else if (runAs.variationWasUsed("spike")) labels.push("question");
    else if (runAs.variationWasUsed("enhancement", "feat", "feature"))
      labels.push("enhancement");
    else if (runAs.variationWasUsed("documentation", "doc"))
      labels.push("documentation");

    let issue = await this.githubService.createIssue({
      title,
      body: body + metadata,
      labels: labels,
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
