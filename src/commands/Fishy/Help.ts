import { FishyChildCommand } from "./FishyChildCommand";

export class Help extends FishyChildCommand {
  idSeed = "csr duna";

  description = "View help about the fishy minigame";
  usage = [""];

  slashCommand = true;

  async run() {
    const embed = this.newEmbed().setAuthor(
      this.generateEmbedAuthor("Fishy help")
    );

    embed
      .setDescription(
        `
Fishy is a fishing minigame built into Gowon!
To get started, run \`${this.prefix}fishy\`.

**Commands**
\`${this.prefix}fishy\` - Go fishing!
\`${this.prefix}fishypedia <fishy>\` - View information about a fishy
\`${this.prefix}fishy collection\` - See your progress in collecting every fishy
\`${this.prefix}fishy cooldown\` - See how long until you can fish again
\`${this.prefix}fishy profile\` - See your fishy profile, including some fun stats
\`${this.prefix}fishy stats\` - See some fun stats about your fishing career
\`${this.prefix}fishy quest\` - Get a new quest, or see your current quest
\`${this.prefix}aquarium\` - Check in on your fishy

If you're a patron, you can add a fishy reminder to your nowplaying config with \`${this.prefix}npc add fishy-reminder\`

Happy fishing!
`
      )
      .setFooter({
        text: `All fish you catch are kept in a sustainable and infinitely large aquarium :)`,
      });
    await this.send(embed);
  }
}
