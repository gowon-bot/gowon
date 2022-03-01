import { format } from "date-fns";
import { BaseCommand, Variation } from "../../lib/command/BaseCommand";
import { StringArgument } from "../../lib/context/arguments/argumentTypes/StringArgument";
import { Validation } from "../../lib/validation/ValidationChecker";
import { validators } from "../../lib/validation/validators";
import { displayLink } from "../../lib/views/displays";
import { GithubService } from "../../services/Github/GithubService";
import { ServiceRegistry } from "../../services/ServicesRegistry";

const args = {
  title: new StringArgument({ splitOn: "|", required: true }),
  body: new StringArgument({ index: { start: 1 }, splitOn: "|" }),
} as const;

export default class Issue extends BaseCommand<typeof args> {
  idSeed = "apink bomi";

  description = "Create a github issue on the gowon repository";
  subcategory = "developer";
  secretCommand = true;
  usage = ["title | body"];
  devCommand = true;

  variations: Variation[] = [
    {
      name: "bug",
      variation: "bug",
      description: "Add the bug label",
    },
    {
      name: "feature",
      variation: ["enhancement", "feat", "feature"],
      description: "Add the enhancement label",
    },
    {
      name: "enhancement",
      variation: ["documentation", "doc"],
      description: "Add the documentation label",
    },
    {
      name: "spike",
      variation: ["spike", "question"],
      description: "Add the question label",
    },
  ];

  arguments = args;

  validation: Validation = {
    title: new validators.Required({}),
  };

  githubService = ServiceRegistry.get(GithubService);

  async run() {
    let title = this.parsedArguments.title,
      body = this.parsedArguments.body;

    let metadata = `


## Notes from Gowon:

${
  this.payload.isMessage()
    ? displayLink("Jump to message", this.payload.source.url)
    : ""
}

**Author**: ${this.author.username} (${
      this.payload.member?.nickname || "*No Nickname*"
    })
**Ran at**: ${format(new Date(), "h:mma 'on' MMMM do, yyyy")}
**Channel:** \\#${
      this.payload.guild?.channels.cache.find(
        (c) => c.id === this.payload.channel.id
      )?.name
    }
**Guild**: ${this.guild.name}`;

    const labels = ["user feedback"];

    if (this.variationWasUsed("bug")) labels.push("bug");
    else if (this.variationWasUsed("spike")) labels.push("question");
    else if (this.variationWasUsed("enhancement")) labels.push("enhancement");
    else if (this.variationWasUsed("documentation"))
      labels.push("documentation");

    let issue = await this.githubService.createIssue(this.ctx, {
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
        "There was an issue submitting feedback, you can dm the author at john!#2527"
      );
    }
  }
}
