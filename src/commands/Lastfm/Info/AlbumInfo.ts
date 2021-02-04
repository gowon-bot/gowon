import { Arguments } from "../../../lib/arguments/arguments";
import { InfoCommand } from "./InfoCommand";
import { numberDisplay } from "../../../helpers";
import { calculatePercent } from "../../../helpers/stats";
import { LinkConsolidator } from "../../../helpers/lastFM";
import { LineConsolidator } from "../../../lib/LineConsolidator";
import { standardMentions } from "../../../lib/arguments/mentions/mentions";

const args = {
  inputs: {
    artist: { index: 0, splitOn: "|" },
    album: { index: 1, splitOn: "|" },
  },
  mentions: standardMentions,
} as const;

export default class AlbumInfo extends InfoCommand<typeof args> {
  idSeed = "nature uchae";

  shouldBeIndexed = true;

  aliases = ["ali", "li", "als", "ls"];
  description = "Displays some information about an album";
  usage = ["", "artist | album"];

  arguments: Arguments = args;

  lineConsolidator = new LineConsolidator();

  async run() {
    let artist = this.parsedArguments.artist,
      album = this.parsedArguments.album;

    let { senderUsername, username, perspective } = await this.parseMentions({
      senderRequired: !artist || !album,
    });

    if (!artist || !album) {
      let nowPlaying = await this.lastFMService.nowPlayingParsed(
        senderUsername
      );

      if (!artist) artist = nowPlaying.artist;
      if (!album) album = nowPlaying.album;
    }

    let [albumInfo, userInfo, spotifyAlbum] = await Promise.all([
      this.lastFMService.albumInfo({ artist, album, username }),
      this.lastFMService.userInfo({ username }),
      this.spotifyService.searchAlbum(artist, album),
    ]);

    this.tagConsolidator.addTags(albumInfo.tags.tag);

    let linkConsolidator = new LinkConsolidator([
      LinkConsolidator.spotify(spotifyAlbum?.external_urls?.spotify),
      LinkConsolidator.lastfm(albumInfo.url),
    ]);

    let albumDuration = albumInfo.tracks.track.reduce(
      (sum, t) => sum + t.duration.toInt(),
      0
    );

    this.lineConsolidator.addLines(
      {
        shouldDisplay: albumInfo.tracks.track.length > 0 && !!albumDuration,
        string: `_${numberDisplay(
          albumInfo.tracks.track.length,
          "track"
        )} (${numberDisplay(Math.ceil(albumDuration / 60), "minute")})_`,
      },
      {
        shouldDisplay: albumInfo.tracks.track.length > 0 && !albumDuration,
        string: `_${numberDisplay(albumInfo.tracks.track.length, "track")}_`,
      },
      {
        shouldDisplay: albumInfo.tracks.track.length > 0,
        string: "",
      },
      {
        shouldDisplay: !!albumInfo.wiki?.summary?.trim(),
        string: this.scrubReadMore(albumInfo.wiki?.summary.trimRight())!,
      },
      {
        shouldDisplay: !!albumInfo.wiki?.summary?.trim(),
        string: "",
      },
      {
        shouldDisplay: this.tagConsolidator.hasAnyTags(),
        string: `**Tags:** ${this.tagConsolidator.consolidate().join(" ‧ ")}`,
      },
      {
        shouldDisplay: linkConsolidator.hasLinks(),
        string: `**Links**: ${linkConsolidator.consolidate()}`,
      }
    );

    let percentage = calculatePercent(
      albumInfo.userplaycount,
      albumInfo.playcount
    );

    let embed = this.newEmbed()
      .setTitle(albumInfo.name.italic() + " by " + albumInfo.artist.strong())
      .setDescription(this.lineConsolidator.consolidate())
      .setURL(albumInfo.url)
      .setImage(
        albumInfo.image.find((i) => i.size === "large")?.["#text"] ||
          (spotifyAlbum &&
            this.spotifyService.getImageFromSearchItem(spotifyAlbum)) ||
          ""
      )
      .addFields(
        {
          name: "Listeners",
          value: numberDisplay(albumInfo.listeners),
          inline: true,
        },
        {
          name: "Playcount",
          value: numberDisplay(albumInfo.playcount),
          inline: true,
        },
        {
          name: `${perspective.upper.possessive} stats`,
          value: `
        \`${numberDisplay(albumInfo.userplaycount, "` play", true)} by ${
            perspective.objectPronoun
          } (${calculatePercent(
            albumInfo.userplaycount,
            userInfo.playcount,
            4
          ).strong()}% of ${perspective.possessivePronoun} total scrobbles)
        ${
          parseFloat(percentage) > 0
            ? `${perspective.upper.regularVerb(
                "account"
              )} for ${percentage.strong()}% of all scrobbles of this album!`
            : ""
        }`,
        }
      )
      .setFooter(
        albumInfo.image.find((i) => i.size === "large")?.["#text"]
          ? "Image source: Last.fm"
          : spotifyAlbum &&
            this.spotifyService.getImageFromSearchItem(spotifyAlbum)
          ? "Image source: Spotify"
          : ""
      );

    this.send(embed);
  }
}
