import { LogicError } from "../../errors/errors";
import { LastfmLinks } from "../../helpers/lastfm/LastfmLinks";
import { prefabArguments } from "../../lib/context/arguments/prefabArguments";
import { ArgumentsMap } from "../../lib/context/arguments/types";
import { LastFMBaseCommand } from "./LastFMBaseCommand";

const args = {
  ...prefabArguments.album,
} satisfies ArgumentsMap;

export default class ImageUpload extends LastFMBaseCommand<typeof args> {
  idSeed = "shasha gowoon";

  aliases = ["iu", "아이유"];
  description =
    "Links you directly to the upload page for your currently playing album";
  usage = [""];

  slashCommand = true;

  arguments = args;

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

    await this.send("<" + LastfmLinks.imageUploadLink(artist, album) + ">");
  }
}
