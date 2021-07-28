export function getArtistPlays(values: any): {
  plays: number | undefined;
  name: string | undefined;
} {
  if (values.artistInfo?.userPlaycount) {
    return {
      plays: values.artistInfo.userPlaycount,
      name: values.artistInfo.name,
    };
  } else if (values.artistPlays.length) {
    return {
      plays: values.artistPlays[0].playcount,
      name: values.artistPlays[0].artist.name,
    };
  }

  return { plays: undefined, name: undefined };
}
