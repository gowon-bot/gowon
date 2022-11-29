import { Setting } from "../../database/entity/Setting";
import { BaseService } from "../../services/BaseService";
import { GowonContext } from "../context/Context";
import { Settings, SettingsMap } from "./Settings";
import {
  BaseSetting,
  BotScope,
  GuildMemberScope,
  GuildScope,
  UserScope,
} from "./SettingTypes";

export type SettingName = keyof SettingsMap;
export type SettingScope = UserScope | GuildMemberScope | GuildScope | BotScope;

type UnwrapSettingScope<T extends SettingName> =
  SettingsMap[T] extends BaseSetting<infer U> ? U : never;

interface Cache {
  [setting: string]: {
    [scope: string]: string;
  };
}

export class SettingsService extends BaseService {
  private cache: Cache;

  constructor() {
    super();
    this.cache = Object.keys(Settings).reduce((acc, val) => {
      const setting: BaseSetting<unknown> = (Settings as any)[val];
      acc[setting.name] = {};

      return acc;
    }, {} as Cache);
  }

  async init() {
    const settings = await this.getAllSettings();

    for (const setting of settings) {
      const scope = this.buildScope(setting);

      if (this.cache[setting.name]) {
        this.cache[setting.name][scope] = setting.value;
      }
    }
  }

  get<T extends SettingName>(
    settingName: T,
    scope: UnwrapSettingScope<T>
  ): string | undefined {
    const setting = Settings[settingName];
    const stringScope = JSON.stringify(setting.transformScope(scope as any));

    return this.cache[setting.name][stringScope] || setting.options.default;
  }

  getByName<T extends SettingScope = SettingScope>(
    settingName: string,
    scope: T
  ): string | undefined {
    const settingKey = convertSettingNameToKey(settingName);

    if (settingKey) return this.get(settingKey, scope);
    return undefined;
  }

  async set<T extends SettingName>(
    ctx: GowonContext,
    settingName: T,
    scope: UnwrapSettingScope<T>,
    value?: string
  ): Promise<Setting | undefined> {
    this.log(ctx, `Setting ${settingName} for ${JSON.stringify(scope)}`);

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

export function convertSettingNameToKey(
  settingName: string
): SettingName | undefined {
  return Object.keys(Settings).find(
    (s) => Settings[s as SettingName].name === settingName
  ) as SettingName | undefined;
}
