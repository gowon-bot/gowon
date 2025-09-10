import { Variation } from "../../../../lib/command/Command";
import { SuccessEmbed } from "../../../../lib/ui/embeds/SuccessEmbed";
import { SpotifyRepeatState } from "../../../../services/Spotify/SpotifyService";
import { SpotifyChildCommand } from "../SpotifyChildCommand";

export class Loop extends SpotifyChildCommand {
  idSeed = "newjeans hyein";

  description = "Loops or unloops a song in Spotify";
  aliases = ["unloop"];

  variations: Variation[] = [
    {
      name: "unloop",
      variation: "unloop",
      description: "Unloops the current song",
    },
  ];

  async run() {
    await this.getMentions({ fetchSpotifyToken: true });

    if (this.variationWasUsed("unloop")) {
      await this.spotifyService.setRepeatState(
        this.ctx,
        SpotifyRepeatState.Off
      );

      await this.reply(
        new SuccessEmbed().setDescription("Successfully turned looping off!")
      );
    } else {
      await this.spotifyService.setRepeatState(
        this.ctx,
        SpotifyRepeatState.Track
      );

      await this.reply(
        new SuccessEmbed().setDescription("Successfully turned looping on!")
      );
    }
  }
}
