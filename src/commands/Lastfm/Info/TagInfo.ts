import { InfoCommand } from "./InfoCommand";
import { Validation } from "../../../lib/validation/ValidationChecker";
import { validators } from "../../../lib/validation/validators";
import { displayNumber } from "../../../lib/views/displays";
import { StringArgument } from "../../../lib/context/arguments/argumentTypes/StringArgument";

const args = {
  tag: new StringArgument({
    index: { start: 0 },
    required: true,
    description: "The name of the tag to lookup",
  }),
} as const;

export default class TagInfo extends InfoCommand<typeof args> {
  idSeed = "csvc park moonchi";
  shouldBeIndexed = true;

  aliases = ["tai", "gi"];
  description = "Displays some information about a tag";
  usage = ["tag"];

  slashCommand = true;

  arguments = args;

  validation: Validation = {
    tag: new validators.Required({}),
  };

  async run() {
    let tag = this.parsedArguments.tag;

    let tagInfo = await this.lastFMService.tagInfo(this.ctx, { tag });

    let embed = this.newEmbed()
      .setTitle(tagInfo.name)
      .addFields(
        {
          name: "Listeners",
          value: displayNumber(tagInfo.listeners),
          inline: true,
        },
        { name: "Uses", value: displayNumber(tagInfo.uses), inline: true }
      )
      .setURL(this.getLinkFromBio(tagInfo.wiki.summary) || "")
      .setDescription(this.scrubReadMore(tagInfo.wiki.summary) || "");

    this.send(embed);
  }
}
