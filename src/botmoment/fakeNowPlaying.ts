import { MessageEmbed } from "discord.js";

import tracks from "./nowPlayingSongs.json";
import { LinkGenerator } from "../helpers/lastFM";
import { generateLink } from "../helpers/discord";

export function isBotMoment(discordID?: string): boolean {
  return discordID === "720135602669879386";
}

export function fakeNowPlaying(): MessageEmbed {
  let track = tracks[~~(tracks.length * Math.random())];

  let links = {
    artist: LinkGenerator.artistPage(track.artist),
    album: LinkGenerator.albumPage(track.artist, track.album),
    track: LinkGenerator.trackPage(track.artist, track.track),
  };

  let nowPlayingEmbed = new MessageEmbed()
    .setColor("yellow")
    .setAuthor(`Now playing for bot_moment`)
    .setTitle(track.track)
    .setURL(links.track)
    .setDescription(
      `by **${generateLink(track.artist, links.artist)}** from _${generateLink(
        track.album,
        links.album
      )}_`
    )
    .setThumbnail(track.albumURL)
    .setFooter("Ha!");

  return nowPlayingEmbed;
}
