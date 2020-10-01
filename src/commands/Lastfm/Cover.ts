import { Message } from "discord.js";
import { LogicError } from "../../errors";
import { Arguments } from "../../lib/arguments/arguments";
import { LastFMBaseCommand } from "./LastFMBaseCommand";

export default class Cover extends LastFMBaseCommand {
  aliases = ["co"];
  description = "Shows the cover for an album";
  usage = ["", "artist | artist @user"];

  arguments: Arguments = {
    mentions: {
      user: {
        index: 0,
        description: "The user to lookup",
        nonDiscordMentionParsing: this.ndmp,
      },
    },
    inputs: {
      artist: { index: 0, splitOn: "|" },
      album: { index: 1, splitOn: "|" },
    },
  };

  async run(_: Message) {
    let artist = this.parsedArguments.artist as string,
      album = this.parsedArguments.album as string;

    let { username } = await this.parseMentionedUsername();

    if (!artist && !album) {
      let nowPlaying = await this.lastFMService.nowPlaying(username);

      let image = nowPlaying.image.find((i) => i.size === "extralarge");

      if (!image) throw new LogicError("that album doesn't have a cover!");

      await this.sendWithFiles(
        `Cover for ${nowPlaying.album["#text"].bold()} by ${nowPlaying.artist[
          "#text"
        ].bold()}`,
        [image?.["#text"] ?? ""]
      );
    } else {
      if (!artist || !album) {
        let nowPlaying = await this.lastFMService.nowPlayingParsed(username);

        if (!artist) artist = nowPlaying.artist;
        if (!album) album = nowPlaying.album;
      }

      let albumDetails = await this.lastFMService.albumInfo({ artist, album });
      let image = albumDetails.image.find((i) => i.size === "extralarge");

      if (!image?.["#text"]) throw new LogicError("that album doesn't have a cover!");

      await this.sendWithFiles(
        `Cover for ${albumDetails.name.italic()} by ${albumDetails.artist.bold()}`,
        [image?.["#text"] ?? ""]
      );
    }
  }
}
