import { LogicError } from "../../errors";
import { LinkGenerator } from "../../helpers/lastFM";
import { prefabArguments } from "../../lib/context/arguments/prefabArguments";
import { LastFMBaseCommand } from "./LastFMBaseCommand";

const args = {
  ...prefabArguments.album,
} as const;

export default class ImageUpload extends LastFMBaseCommand<typeof args> {
  idSeed = "shasha gowoon";

  aliases = ["iu", "아이유"];
  description =
    "Links you directly to the upload page for your currently playing album";
  usage = [""];

  arguments = args;

  async run() {
    const { senderRequestable } = await this.parseMentions();

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
