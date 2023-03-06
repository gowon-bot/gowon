import { ArgumentsMap } from "../../lib/context/arguments/types";
import { MockContext } from "../MockContext";
import { BaseMockService } from "./BaseMockService";

export class MockArgumentParsingService extends BaseMockService {
  parseContext(context: MockContext, _args: ArgumentsMap): any {
    return context.mocked?.arguments || {};
  }
}
