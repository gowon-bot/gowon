import { GowonContext } from "../../lib/context/Context";
import { BaseMockService } from "./BaseMockService";

export class MockTrackingService extends BaseMockService {
  error(_: GowonContext, __: Error) {}
}
