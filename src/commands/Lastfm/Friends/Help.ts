import { FriendsChildCommand } from "./FriendsChildCommand";

export class Help extends FriendsChildCommand {
  idSeed = "csr yeham";

  description = "View help about the fishy minigame";
  usage = [""];

  slashCommand = true;

  async run() {
    const embed = this.newEmbed().setAuthor(
      this.generateEmbedAuthor("Friends help")
    );

    embed
      .setDescription(
        `
**Adding/Removing Friends**
To add friends, use \`${this.prefix}fr add <username>\`.
To remove friends, you can use \`${this.prefix}fr remove <username>\` or \`${this.prefix}fr clear\`

**Aliases**
You can also set aliases for friends with \`${this.prefix}fr alias <username> nickname\`. 
If you have an alias set for a friend, you can use that alias to mention them. For example, \`${this.prefix}tp f:alias_you_set\`

**Commands**
\`${this.prefix}fr\` - List all your friends and see what they're listening to
\`${this.prefix}fr p\`/\`lp\`/\`tp\` - See how many plays your friends have of an artist/album/track
\`${this.prefix}fr joined\` - See when your friends joined last.fm
\`${this.prefix}fr scrobbles\` - See how many scrobbles your friends have
\`${this.prefix}fr rating\` - See what your friends rated an album
\`${this.prefix}fr whofirst\` - See when your friends first listened to an artist
        `
      )
      .setFooter({
        text: `All fish you catch are kept in a sustainable and infinitely large aquarium :)`,
      });
    await this.send(embed);
  }
}
