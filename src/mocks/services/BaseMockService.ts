import { GowonContext } from "../../lib/context/Context";
import { BaseService } from "../../services/BaseService";

export abstract class BaseMockService<
  ContextT extends GowonContext = GowonContext<{}>
> extends BaseService<ContextT> {
  mocks = this.constructor.name.replace("Mock", "");

  protected log(_: ContextT, __: string): void {}
}
