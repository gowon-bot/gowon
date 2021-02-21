import { Setting } from "../../database/entity/Setting";
import { Settings, SettingsMap } from "./Settings";
import {
  UserScope,
  GuildMemberScope,
  GuildScope,
  BaseSetting,
} from "./SettingTypes";

type SettingName = keyof SettingsMap;
type Scope = UserScope | GuildMemberScope | GuildScope;

interface Cache {
  [setting: string]: {
    [scope: string]: string;
  };
}

export class SettingsManager {
  public cache: Cache;

  constructor() {
    this.cache = Object.keys(Settings).reduce((acc, val) => {
      const setting: BaseSetting = (Settings as any)[val];
      acc[setting.name] = {};

      return acc;
    }, {} as Cache);
  }

  async init() {
    const settings = await this.getAllSettings();

    for (const setting of settings) {
      const scope = this.buildScope(setting);

      this.cache[setting.name][scope] = setting.value;
    }
  }

  get(settingName: keyof SettingsMap, scope: Scope): string | undefined {
    const setting = Settings[settingName];
    const stringScope = JSON.stringify(setting.transformScope(scope as any));

    return this.cache[setting.name][stringScope];
  }

  async set(
    settingName: SettingName,
    scope: Scope,
    value?: string
  ): Promise<Setting | undefined> {
    const setting = Settings[settingName];
    const stringScope = JSON.stringify(setting.transformScope(scope as any));

    const newSetting = await setting.createUpdateOrDelete(scope as any, value);

    this.updateCache(setting.name, stringScope, newSetting);

    return newSetting;
  }

  private buildScope(setting: Setting): string {
    const scope: { scope?: string; secondaryScope?: string } = {};

    if (setting.scope) scope.scope = setting.scope;
    if (setting.secondaryScope) scope.secondaryScope = setting.secondaryScope;

    return JSON.stringify(scope);
  }

  private async getAllSettings() {
    return await Setting.find();
  }

  private updateCache(settingName: string, scope: string, setting?: Setting) {
    if (!setting) {
      delete this.cache[settingName][scope];
    } else {
      this.cache[settingName][scope] = setting.value;
    }
  }
}
