import { Message } from "discord.js";
import { GowonContext } from "../../lib/context/Context";
import { BaseMockService } from "./BaseMockService";

export class MockMetaService extends BaseMockService {
  async recordCommandRun(
    _ctx: GowonContext,
    _commandID: string,
    _message: Message
  ) {}
}
