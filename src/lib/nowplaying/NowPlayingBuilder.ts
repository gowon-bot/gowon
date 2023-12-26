import { asyncMap } from "../../helpers";
import { UNUSED_CONFIG } from "../../services/dbservices/NowPlayingService";
import { PresentedComponent } from "./base/BaseNowPlayingComponent";
import {
  compoundComponentList,
  getComponentByName,
  NowPlayingComponent,
} from "./componentMap";
import { UnusedComponent } from "./components/UnusedComponent";
import { ResolvedDependencies } from "./DatasourceService";

export class NowPlayingBuilder {
  components: NowPlayingComponent[];

  constructor(componentNames: string[]) {
    if (componentNames[0] === UNUSED_CONFIG) {
      this.components = [UnusedComponent];
      return;
    }

    let compoundedComponentNames = componentNames;

    for (const compoundComponent of compoundComponentList) {
      compoundedComponentNames = compoundComponent.replaceComponentsInArray(
        compoundedComponentNames,
        compoundComponent.componentName,
        compoundComponent.replaces
      );
    }

    this.components = compoundedComponentNames.map(
      (name) => getComponentByName(name)!
    );
  }

  generateDependencies(): string[] {
    const dependencies = new Set(
      this.components.map((c) => new c({}).dependencies).flat()
    );

    return Array.from(dependencies.values());
  }

  // This function does three things:
  // - Resolves promises
  // - Moves components around according to placeAfter
  // - Flattens out multiple component returns
  public async getPresentedComponents(
    resolvedDependencies: ResolvedDependencies
  ): Promise<PresentedComponent[]> {
    const promises = await asyncMap(
      this.components,
      async (c) =>
        [
          (c as any).componentName,
          await Promise.resolve(new c(resolvedDependencies).present()),
        ] as [string, PresentedComponent | PresentedComponent[]]
    );

    const initialComponentList = this.flattenPresentedComponents(promises);
    const newComponentList = JSON.parse(
      JSON.stringify(initialComponentList)
    ) as [string, PresentedComponent][];

    for (let index = 0; index < initialComponentList.length; index++) {
      const [_, component] = initialComponentList[index];

      this.handleComponent(component, newComponentList, index);
    }

    return newComponentList.map(([_, c]) => c).flat();
  }

  private handleComponent(
    component: PresentedComponent,
    newComponentList: [string, PresentedComponent | PresentedComponent[]][],
    componentIndex: number
  ) {
    if (component.placeAfter) {
      let findIndex: number | undefined;

      for (const placeAfter of component.placeAfter) {
        const placeAfterIndex = newComponentList.findIndex(
          ([componentName]) => componentName === placeAfter
        );

        if (findIndex !== -1) {
          findIndex = placeAfterIndex;
          break;
        }
      }

      if (findIndex !== undefined) {
        arrayMoveInPlace(newComponentList, {
          from: componentIndex,
          to: findIndex,
        });
      }
    }
  }

  private flattenPresentedComponents(
    componentList: [string, PresentedComponent | PresentedComponent[]][]
  ): [string, PresentedComponent][] {
    const flattenedlist = [] as [string, PresentedComponent][];

    for (const [componentName, component] of componentList) {
      const miniComponentList =
        component instanceof Array ? component : [component];

      flattenedlist.push(
        ...miniComponentList.map(
          (c) => [componentName, c] as [string, PresentedComponent]
        )
      );
    }

    return flattenedlist;
  }
}

// Credit: Reid on stackoverflow
// https://stackoverflow.com/questions/5306680/move-an-array-element-from-one-array-position-to-another
function arrayMoveInPlace(
  array: Array<any>,
  { from, to }: { from: number; to: number }
) {
  if (to >= array.length) {
    var k = to - array.length + 1;
    while (k--) {
      array.push(undefined);
    }
  }
  array.splice(to, 0, array.splice(from, 1)[0]);
}
