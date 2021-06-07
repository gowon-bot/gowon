import { Message } from "discord.js";
import { LogicError } from "../../errors";
import { LinkGenerator } from "../../helpers/lastFM";
import { Arguments } from "../../lib/arguments/arguments";
import { LastFMBaseCommand } from "./LastFMBaseCommand";

const args = {} as const;

export default class ImageUpload extends LastFMBaseCommand<typeof args> {
  idSeed = "shasha gowoon";

  aliases = ["iu"];
  description =
    "Links you directly to the upload page for your currently playing album";
  usage = [""];

  arguments: Arguments = args;

  async run(_: Message) {
    const { senderRequestable } = await this.parseMentions();

    const nowPlaying = await this.lastFMService.nowPlaying(senderRequestable);

    if (!nowPlaying.album) {
      throw new LogicError(
        "You can't upload an image for a track with no album!"
      );
    }

    await this.send(
      "<" +
        LinkGenerator.imageUploadLink(nowPlaying.artist, nowPlaying.album) +
        ">"
    );
  }
}
