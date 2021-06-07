import { Arguments } from "../../../lib/arguments/arguments";
import { OverviewChildCommand } from "./OverviewChildCommand";

const args = {
  inputs: {},
} as const;

export class Help extends OverviewChildCommand<typeof args> {
  idSeed = "shasha a ryeom";

  description = "View help about overview";
  usage = [""];

  arguments: Arguments = args;

  async run() {
    const embed = this.newEmbed().setAuthor(
      ...this.generateEmbedAuthor("Overview help")
    );

    embed.setDescription(
      `
The overview command allows you to see many stats about your last.fm account! The following statistics are available:

Use \`${this.prefix}o <statistic>\` to use one. Run \`${this.prefix}help o <statistic>\` to see more about a specific one

**Statistics**:

\`all\` - Shows all statistics in a single embed

\`joined\` - When a user joined Last.fm
\`avgperday\` - A user's average scrobble count per day
\`scrobblesperartist\` - A user's average scrobbles per artist
\`scrobblesperalbum\` - A user's average scrobbles per album
\`scrobblespertrack\` - A user's average scrobbles per track
\`per\` - A couple averages about a user's library
\`hindex\` - A user's h-index (See help for more)
\`toppercent\` - Shows how many artists make up at least 50% of a user's scrobbles
\`sumtop\` - Shows what percent of a user's scrobbles are made up of their top artists
\`crowns\` - Shows some stats about a user's crowns
\`breadth\` - Shows a user's breadth rating.
\`playsover\` - Shows how many artists a user has over some common scrobble tiers
`
    );

    await this.send(embed);
  }
}
