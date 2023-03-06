import { BaseMockService } from "./BaseMockService";

export class MockNicknameService extends BaseMockService {
  async recordNickname(_ctx: any, _discordID: string, _nickname: string) {}
  async recordUsername(_ctx: any, _discordID: string, _username: string) {}
}
