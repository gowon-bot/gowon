import { TrackInfo } from "../services/LastFM/converters/InfoTypes";
import { RawTrackInfo } from "../services/LastFM/LastFMService.types";

export const mockResponses = {
  trackInfo(overrides: Partial<RawTrackInfo>) {
    const artist = "Red Velvet";

    return new TrackInfo(
      Object.assign(
        {
          ...mockBaseInfo("Sunny Side Up!"),
          artist: mockBaseInfo(artist),
          album: mockAlbum(artist, "ReVe Festival Day 1"),
          wiki: mockWiki(),
          duration: "120",
          streamable: { "#text": "no", fulltrack: "1" },
          listeners: "120",
          playcount: "120",
          userplaycount: "120",
          userloved: "0",
          toptags: { tag: [] },
        },
        overrides
      )
    );
  },
};

function mockBaseInfo(name: string) {
  return {
    name,
    mbid: "",
    url: "",
  };
}

function mockAlbum(artist: string, album: string) {
  return {
    artist,
    title: album,
    mbid: "",
    url: "",
    "@attr": { position: "1" },
    image: [],
  };
}

function mockWiki() {
  return {
    wiki: {
      published: "",
      summary: "",
      content: "",
    },
  };
}
