import { Setting } from "../../database/entity/Setting";
import { GowonContext } from "../../lib/context/Context";
import { Settings } from "../../lib/settings/Settings";
import {
  convertSettingNameToKey,
  SettingName,
  SettingScope,
} from "../../lib/settings/SettingsService";
import { BaseMockService } from "./BaseMockService";

export class MockSettingsService extends BaseMockService {
  async init() {}

  get(settingName: SettingName, _scope: SettingScope): string | undefined {
    return Settings[settingName].options.default;
  }

  getByName(settingName: string, _scope: SettingScope): string | undefined {
    const settingKey = convertSettingNameToKey(settingName);

    if (settingKey) return this.get(settingKey, _scope);
    return undefined;
  }

  async set(
    _ctx: GowonContext,
    _settingName: SettingName,
    _scope: SettingScope,
    _value?: string
  ): Promise<Setting | undefined> {
    return;
  }
}
