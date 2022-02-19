import { ArgumentsMap } from "../../lib/context/arguments/types";
import { MetaBaseChildCommand } from "./MetaBaseCommand";

export abstract class MetaChildCommand<
  T extends ArgumentsMap = {}
> extends MetaBaseChildCommand<T> {
  parentName = "meta";
  subcategory = "meta";
  devCommand = true;
}
