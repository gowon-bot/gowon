import { User as DBUser } from "../../database/entity/User";
import { Message, User } from "discord.js";
import { Tag } from "../../services/LastFM/LastFMService.types";
import { Resources } from "./DatasourceService";
import { RequirementMap } from "./RequirementMap";
import { Crown } from "../../database/entity/Crown";
import { ParsedTrack } from "../../helpers/lastFM";

function createTags(tags: string[]): Tag[] {
  return tags.map((t) => ({
    name: t,
    url: `https://last.fm/tag/${t}`,
  }));
}

export const mockRequirements = (
  message: Message
): RequirementMap & Resources => {
  const nowPlaying: ParsedTrack = {
    artist: "Red Velvet",
    album: "Rookie - The 4th Mini Album",
    name: "Rookie",
    nowPlaying: true,
  };

  const dbUser = DBUser.create({
    id: 1,
    // gowon's id
    discordID: "720135602669879386",
    lastFMUsername: "gowon_",
    isIndexed: true,
  });

  return {
    // Resources
    message,
    username: "gowon_",
    dbUser,

    // Lastfm Types
    artistInfo: {
      name: nowPlaying.artist,
      url: "",
      streamable: "",
      ontour: "",
      similar: { artist: [] },
      bio: {
        links: {
          link: {
            "#text": "",
            rel: "",
            href: "",
          },
        },
        published: "",
        summary: "",
        content: "",
      },
      stats: {
        listeners: "310559",
        userplaycount: "6245",
        playcount: "48614364",
      },
      tags: {
        tag: createTags(["k-pop", "korean", "pop", "female vocalists"]),
      },
    },

    trackInfo: {
      mbid: "",
      name: nowPlaying.name,
      url: "",
      duration: "197000",
      streamable: {
        "#text": "0",
        fulltrack: "0",
      },
      listeners: "61769",
      playcount: "898585",
      userplaycount: "179",
      userloved: "1",
      artist: {
        name: nowPlaying.artist,
        mbid: "",
        url: "",
      },
      album: {
        artist: nowPlaying.artist,
        title: nowPlaying.album,
        url: "",
        image: [],
        mbid: "",
        "@attr": { position: "" },
      },
      toptags: {
        tag: createTags(["Korean", "kpop", "pop", "k-pop", "2017"]),
      },
      wiki: {
        published: "",
        summary: "",
        content: "",
      },
    },

    recentTracks: {
      recenttracks: {
        track: [
          {
            name: nowPlaying.name,
            artist: { "#text": nowPlaying.artist, mbid: "" },
            "@attr": { nowplaying: "" },
            mbid: "",
            album: {
              mbid: "",
              "#text": nowPlaying.album,
            },
            image: [],
            streamable: "",
            url: "",
            date: { uts: "", "#text": "1620625939536" },
          },
        ],
        "@attr": {
          total: "81841",
          perPage: "0",
          totalPages: "0",
          page: "",
          user: "",
        },
      },
    },

    // Gowon types
    artistCrown: {
      user: { id: "720135602669879386", username: "Gowon" } as User,
      crown: Crown.create({
        id: 1,
        serverID: message.guild!.id,
        user: dbUser,
        plays: 6360,
      }),
    },

    // Indexer types
    albumPlays: [
      {
        album: { name: nowPlaying.album, artist: { name: nowPlaying.artist } },
        playcount: 605,
      },
    ],
    artistPlays: [
      {
        artist: { name: nowPlaying.artist },
        playcount: 6360,
      },
    ],
    albumRating: [
      {
        rating: 7,
        rateYourMusicAlbum: {
          title: nowPlaying.album,
          artistName: nowPlaying.artist,
        },
      },
    ],
  };
};
