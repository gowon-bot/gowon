import { DependencyMap } from "../DependencyMap";

export function getArtistPlays(values: Partial<DependencyMap>): {
  plays: number | undefined;
  name: string | undefined;
} {
  if (values.artistInfo?.userPlaycount !== undefined) {
    return {
      plays: values.artistInfo.userPlaycount,
      name: values.artistInfo.name,
    };
  } else if (values.artistCount) {
    return {
      plays: values.artistCount.playcount,
      name: values.artistCount.artist.name,
    };
  }

  return { plays: undefined, name: undefined };
}
