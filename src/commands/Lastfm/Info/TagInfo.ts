import { Arguments } from "../../../lib/arguments/arguments";
import { InfoCommand } from "./InfoCommand";
import { numberDisplay } from "../../../helpers";
import { Validation } from "../../../lib/validation/ValidationChecker";
import { validators } from "../../../lib/validation/validators";

const args = {
  inputs: {
    tag: { index: { start: 0 } },
  },
} as const;

export default class TagInfo extends InfoCommand<typeof args> {
  idSeed = "csvc park moonchi";
  shouldBeIndexed = true;

  aliases = ["tai", "gi"];
  description = "Displays some information about a tag";
  usage = ["tag"];

  arguments: Arguments = args;

  validation: Validation = {
    tag: new validators.Required({}),
  };

  async run() {
    let tag = this.parsedArguments.tag!;

    let tagInfo = await this.lastFMService.tagInfo({ tag });

    let embed = this.newEmbed()
      .setTitle(tagInfo.name)
      .addFields(
        {
          name: "Listeners",
          value: numberDisplay(tagInfo.total),
          inline: true,
        },
        { name: "Uses", value: numberDisplay(tagInfo.reach), inline: true }
      )
      .setURL(this.getLinkFromBio(tagInfo.wiki.summary) || "")
      .setDescription(this.scrubReadMore(tagInfo.wiki.summary));

    this.send(embed);
  }
}
