import { Track } from "../../../services/LastFM/LastFMService.types";
import { Resources } from "../DatasourceService";
import { RequirementMap } from "../RequirementMap";

export type NowPlayingRequirement = keyof RequirementMap;
export interface PresentedComponent {
  string: string;
  size: number;
  // someComponents should be placed after certain ones
  placeAfter?: string[];
}

export abstract class BaseNowPlayingComponent<
  Requirements extends readonly NowPlayingRequirement[]
> {
  static readonly componentName: string;
  abstract readonly requirements: Requirements;

  constructor(
    protected values: Pick<RequirementMap, Requirements[number]> & Resources
  ) {}

  protected get nowPlaying(): Track {
    return this.values.recentTracks.recenttracks.track[0];
  }

  abstract present():
    | PresentedComponent
    | PresentedComponent[]
    | Promise<PresentedComponent | PresentedComponent[]>;
}

export class AnyIn {
  constructor(public options: string[]) {}
}

function isAnyIn(value: AnyIn | string[]): value is AnyIn {
  return value instanceof AnyIn;
}

export abstract class BaseCompoundComponent<
  Requirements extends readonly NowPlayingRequirement[]
> extends BaseNowPlayingComponent<Requirements> {
  static replaceComponentsInArray(
    components: string[],
    compoundName: string,
    replaces: string[] | AnyIn
  ): string[] {
    if (components.includes(compoundName)) {
      return components;
    }

    const replaceArray = isAnyIn(replaces) ? replaces.options : replaces;

    let { withoutReplaces, firstIndex } = filterComponents(
      compoundName,
      components,
      replaceArray
    );
    const difference = components.length - withoutReplaces.length;

    const shouldReplace = isAnyIn(replaces)
      ? difference > 0
      : difference === replaceArray.length;

    if (shouldReplace) {
      if (firstIndex !== undefined) {
        withoutReplaces = withoutReplaces.insertAtIndex(
          firstIndex,
          compoundName
        );
      } else {
        withoutReplaces.push(compoundName);
      }

      return withoutReplaces;
    }

    return components;
  }
}

function filterComponents(
  compoundName: string,
  components: string[],
  replaces: string[]
): { firstIndex?: number; withoutReplaces: string[] } {
  const withoutReplaces = [] as string[];
  let firstIndex: number | undefined = undefined;

  for (let cIndex = 0; cIndex < components.length; cIndex++) {
    const component = components[cIndex];

    if (!replaces.includes(component)) {
      withoutReplaces.push(component);
    } else if (firstIndex === undefined) {
      firstIndex = cIndex;
    }
  }

  return {
    withoutReplaces,
    // The tags component should always appear last
    firstIndex: compoundName === "tags" ? undefined : firstIndex,
  };
}
