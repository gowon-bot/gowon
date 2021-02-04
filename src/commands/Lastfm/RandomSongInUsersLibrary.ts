import { getOrdinal } from "../../helpers";
import { Arguments } from "../../lib/arguments/arguments";
import { standardMentions } from "../../lib/arguments/mentions/mentions";
import { Validation } from "../../lib/validation/ValidationChecker";
import { validators } from "../../lib/validation/validators";
import { LastFMBaseCommand } from "./LastFMBaseCommand";

const args = {
  inputs: {
    poolAmount: {
      regex: /[0-9]+/,
      index: 0,
      number: true,
    },
  },
  mentions: standardMentions,
} as const;

export default class RandomsongInUsersLibrary extends LastFMBaseCommand<
  typeof args
> {
  idSeed = "april yena";

  shouldBeIndexed = false;

  arguments: Arguments = args;

  validation: Validation = {
    poolAmount: {
      validator: new validators.Range({ min: 10 }),
      friendlyName: "pool amount",
    },
  };

  async run() {
    let poolAmount = this.parsedArguments.poolAmount!;

    let { username } = await this.parseMentions();

    let trackCount = await this.lastFMService.trackCount(username);

    let bound =
      poolAmount && poolAmount < trackCount ? poolAmount : trackCount / 2;

    let randomIndex = Math.floor(Math.random() * (bound - 1));

    randomIndex = randomIndex < 0 ? 0 : randomIndex;

    let randomSong = (
      await this.lastFMService.topTracks({
        username,
        limit: 1,
        page: randomIndex,
      })
    ).track[0];

    let trackInfo = await this.lastFMService.trackInfo({
      track: randomSong.name,
      artist: randomSong.artist.name,
    });

    let embed = this.newEmbed()
      .setAuthor(`${username}'s ${getOrdinal(randomIndex - 1)} top track`)
      .setTitle(randomSong.name)
      .setDescription(
        `by ${randomSong.artist.name.strong()}` +
          (trackInfo.album ? ` from ${trackInfo.album.title.italic()}` : "")
      )
      .setThumbnail(
        trackInfo.album?.image.find((i) => i.size === "large")?.["#text"] || ""
      );

    await this.send(embed);
  }
}
