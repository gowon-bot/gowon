import { User } from "discord.js";
import { Crown } from "../../database/entity/Crown";
import { User as DBUser } from "../../database/entity/User";
import { ParsedTrack } from "../../helpers/lastfm";
import { RawTag } from "../../services/LastFM/LastFMService.types";
import {
  ArtistInfo,
  TrackInfo,
} from "../../services/LastFM/converters/InfoTypes";
import { RecentTracks } from "../../services/LastFM/converters/RecentTracks";
import { Payload } from "../context/Payload";
import { Resources } from "./DatasourceService";
import { DependencyMap } from "./DependencyMap";

function createTags(tags: string[]): RawTag[] {
  return tags.map((t) => ({
    name: t,
    url: `https://last.fm/tag/${t}`,
  }));
}

export const mockDependencies = (
  payload: Payload
): DependencyMap & Resources => {
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
    payload,
    username: "gowon_",
    requestable: "gowon_",
    dbUser,
    dependencies: [],
    components: [],
    prefix: "!",

    // Lastfm Types
    artistInfo: new ArtistInfo({
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
    }),

    trackInfo: new TrackInfo({
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
    }),

    recentTracks: new RecentTracks({
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
          image: [
            {
              size: "large",
              "#text":
                "https://lastfm.freetls.fastly.net/i/u/174s/0cc3f20f6d4b0132d77a8a2ed305fa54.jpg",
            },
          ],
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
    }),

    // Gowon types
    artistCrown: {
      user: { id: "720135602669879386", username: "Gowon" } as User,
      crown: Crown.create({
        id: 1,
        serverID: payload.guild!.id,
        user: dbUser,
        plays: 6360,
      }),
    },
    albumCard: undefined,
    fishyProfile: undefined,
    cachedLovedTrack: undefined,
    combo: undefined,

    // Mirrorball types
    albumCount: {
      user: {} as any,
      album: {
        id: 2,
        name: nowPlaying.album,
        artist: { id: 1, name: nowPlaying.artist, tags: [] },
      },
      lastScrobbled: new Date().getTime(),
      firstScrobbled: new Date().getTime(),
      playcount: 605,
    },
    artistCount: {
      user: {} as any,
      artist: { id: 1, name: nowPlaying.artist, tags: [] },
      playcount: 6360,
      lastScrobbled: new Date().getTime(),
      firstScrobbled: new Date().getTime(),
    },
    ambiguousTrackCount: {
      user: {} as any,
      track: {
        artist: { id: 1, name: nowPlaying.artist, tags: [] },
        name: nowPlaying.name,
      },
      playcount: 179,
      lastScrobbled: new Date().getTime(),
      firstScrobbled: new Date().getTime(),
    },
    albumRating: {
      rating: 7,
      rateYourMusicAlbum: {
        rateYourMusicID: "12412",
        title: nowPlaying.album,
        artistName: nowPlaying.artist,
        artistNativeName: "",
        releaseYear: 2014,
      },
    },
    serverArtistRank: {
      rank: 4,
      totalListeners: 678,
    },
    globalArtistRank: {
      rank: 4,
      totalListeners: 678,
    },
  };
};
