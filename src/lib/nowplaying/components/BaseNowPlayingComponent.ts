import { insertAtIndex } from "../../../helpers";
import { RecentTrack } from "../../../services/LastFM/converters/RecentTracks";
import { ExtractedCommand } from "../../command/extractor/ExtractedCommand";
import { GowonContext } from "../../context/Context";
import { Resources } from "../DatasourceService";
import { RequirementMap } from "../RequirementMap";

export type NowPlayingRequirement = keyof RequirementMap;
export interface PresentedComponent {
  string: string;
  size: number;
  // some components should be placed after certain ones
  placeAfter?: string[];
}

export abstract class BaseNowPlayingComponent<
  Requirements extends readonly NowPlayingRequirement[]
> {
  static readonly componentName: string;
  static readonly friendlyName: string;
  static readonly secret: boolean = false;
  abstract readonly requirements: Requirements;

  protected ctx = new GowonContext({
    command: { logger: this.values.logger! } as any,
    custom: {},
    payload: this.values.payload,
    extract: new ExtractedCommand([]),
    gowonClient: {} as any,
  });

  constructor(
    protected values: Pick<RequirementMap, Requirements[number]> & Resources
  ) {
    this.ctx.dangerousSetCommand({
      guild: values.payload?.guild,
    });
  }

  protected get nowPlaying(): RecentTrack {
    return this.values.recentTracks.first();
  }

  abstract present():
    | PresentedComponent
    | PresentedComponent[]
    | Promise<PresentedComponent | PresentedComponent[]>;
}

export class AnyIn {
  constructor(public options: string[]) {}
}

function isAnyIn(value: AnyIn | any): value is AnyIn {
  return value instanceof AnyIn;
}

export abstract class BaseCompoundComponent<
  Requirements extends readonly NowPlayingRequirement[]
> extends BaseNowPlayingComponent<Requirements> {
  static replaceComponentsInArray(
    components: string[],
    compoundName: string,
    replaces: Array<string | AnyIn> | AnyIn
  ): string[] {
    if (components.includes(compoundName)) {
      return components;
    }

    const replaceArray = isAnyIn(replaces) ? replaces.options : replaces;

    let { withoutReplaces, firstIndex, replaced } = filterComponents(
      compoundName,
      components,
      replaceArray
    );
    const difference = components.length - withoutReplaces.length;

    const shouldReplace = isAnyIn(replaces)
      ? difference > 0
      : calculateShouldReplace(difference, replaceArray, replaced);

    if (shouldReplace) {
      if (firstIndex !== undefined) {
        withoutReplaces = insertAtIndex(
          withoutReplaces,
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
  replaces: Array<string | AnyIn>
): { firstIndex?: number; withoutReplaces: string[]; replaced: string[] } {
  const replaced = [] as string[];
  const withoutReplaces = [] as string[];
  let firstIndex: number | undefined = undefined;

  for (let cIndex = 0; cIndex < components.length; cIndex++) {
    const component = components[cIndex];

    if (!arrayIncludes(replaces, component)) {
      withoutReplaces.push(component);
    } else {
      replaced.push(component);

      if (firstIndex === undefined) {
        firstIndex = cIndex;
      }
    }
  }

  return {
    replaced,
    withoutReplaces,
    // The tags component should always appear last
    firstIndex: compoundName === "tags" ? undefined : firstIndex,
  };
}

function arrayIncludes(
  array: Array<string | AnyIn>,
  includes: string
): boolean {
  return array.some((e) => {
    if (isAnyIn(e)) {
      return e.options.includes(includes);
    }
    return e === includes;
  });
}

function calculateShouldReplace(
  difference: number,
  replaces: Array<string | AnyIn>,
  replaced: string[]
): boolean {
  const noAnyIn = replaces.filter((r) => !isAnyIn(r)).sort() as string[];

  return (
    difference >= noAnyIn.length && noAnyIn.every((e) => replaced.includes(e))
  );
}
