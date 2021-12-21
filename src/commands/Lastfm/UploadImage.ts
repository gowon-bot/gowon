import { LogicError } from "../../errors";
import { LinkGenerator } from "../../helpers/lastFM";
import { Arguments } from "../../lib/arguments/arguments";
import { LastFMBaseCommand } from "./LastFMBaseCommand";

const args = {
  inputs: {
    artist: { index: 0, splitOn: "|" },
    album: { index: 1, splitOn: "|" },
  },
} as const;

export default class ImageUpload extends LastFMBaseCommand<typeof args> {
  idSeed = "shasha gowoon";

  aliases = ["iu", "아이유"];
  description =
    "Links you directly to the upload page for your currently playing album";
  usage = [""];

  arguments: Arguments = args;

  async run() {
    const { senderRequestable } = await this.getMentions();

    const { artist, album } = await this.lastFMArguments.getAlbum(
      this.ctx,
      senderRequestable
    );

    if (!album) {
      throw new LogicError(
        "You can't upload an image for a track with no album!"
      );
    }

    await this.send("<" + LinkGenerator.imageUploadLink(artist, album) + ">");
  }
}
