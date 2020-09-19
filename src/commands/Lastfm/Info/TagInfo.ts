import { MessageEmbed } from "discord.js";
import { Arguments } from "../../../lib/arguments/arguments";
import { InfoCommand } from "./InfoCommand";
import { numberDisplay } from "../../../helpers";
import { Validation } from "../../../lib/validation/ValidationChecker";
import { validators } from "../../../lib/validation/validators";

export default class TagInfo extends InfoCommand {
  shouldBeIndexed = true;

  aliases = ["ti", "gi"];
  description = "Display some information about a tag";
  usage = ["tag"];

  arguments: Arguments = {
    inputs: {
      tag: { index: { start: 0 } },
    },
  };

  validation: Validation = {
    tag: new validators.Required({}),
  };

  async run() {
    let tag = this.parsedArguments.tag as string;

    let tagInfo = await this.lastFMService.tagInfo({ tag });

    let embed = new MessageEmbed()
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
