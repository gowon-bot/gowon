import { Message } from "discord.js";
import { LogicError } from "../../errors";
import { Arguments } from "../../lib/arguments/arguments";
import { standardMentions } from "../../lib/arguments/mentions/mentions";
import { LastFMBaseCommand } from "./LastFMBaseCommand";

export default class Cover extends LastFMBaseCommand {
  idSeed = "april chaekyung";

  aliases = ["co"];
  description = "Shows the cover for a given album";
  usage = ["", "artist | album @user"];

  arguments: Arguments = {
    inputs: {
      artist: { index: 0, splitOn: "|" },
      album: { index: 1, splitOn: "|" },
    },
    mentions: standardMentions,
  };

  async run(_: Message) {
    let artist = this.parsedArguments.artist as string,
      album = this.parsedArguments.album as string;

    let { username } = await this.parseMentions({
      usernameRequired: !artist || !album,
    });

    if (!artist && !album) {
      let nowPlaying = await this.lastFMService.nowPlaying(username);

      let image = nowPlaying.image.find((i) => i.size === "extralarge");

      if (!image) throw new LogicError("that album doesn't have a cover!");

      await this.sendWithFiles(
        `Cover for ${nowPlaying.album["#text"].strong()} by ${nowPlaying.artist[
          "#text"
        ].strong()}`,
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

      if (!image?.["#text"])
        throw new LogicError("that album doesn't have a cover!");

      await this.sendWithFiles(
        `Cover for ${albumDetails.name.italic()} by ${albumDetails.artist.strong()}`,
        [image?.["#text"] ?? ""]
      );
    }
  }
}
