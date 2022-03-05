import { Setting } from "../../database/entity/Setting";

type StringSettingType = "text" | "textshort" | "textlong";
type SettingType = "toggle" | "role" | StringSettingType;

interface SettingOptions {
  friendlyName: string;
  description: string;
  category: string;

  omitFromDashboard: boolean;
  type: SettingType;
}

export abstract class BaseSetting<ScopeT = {}> {
  settingDB = Setting;

  constructor(
    public name: string,
    public options: Partial<SettingOptions> = {}
  ) {}

  async get(scope: ScopeT): Promise<Setting | undefined> {
    let whereClause = { name: this.name };

    whereClause = this.setScopeOnWhere(scope, whereClause);

    return await this.settingDB.findOne({ where: whereClause });
  }

  async createUpdateOrDelete(
    scope: ScopeT,
    value?: string
  ): Promise<Setting | undefined> {
    let whereClause = { name: this.name };

    whereClause = this.setScopeOnWhere(scope, whereClause);

    let existingSetting = await this.settingDB.findOne({
      where: whereClause,
    });

    if (existingSetting) {
      if (value === undefined) {
        await this.settingDB.delete(existingSetting);

        return undefined;
      } else {
        existingSetting.value = value;
        await existingSetting.save();
        return existingSetting;
      }
    } else if (value !== undefined) {
      const transformedScope = this.transformScope(scope);
      let setting = this.settingDB.create({
        ...transformedScope,
        name: this.name,
        value: value,
      });

      await setting.save();

      return setting;
    } else return undefined;
  }

  abstract transformScope(scope: ScopeT): {
    scope?: string;
    secondaryScope?: string;
  };

  private setScopeOnWhere(scope: ScopeT, whereClause: any) {
    const transformedScope = this.transformScope(scope);

    return Object.assign(transformedScope, whereClause);
  }
}

export interface UserScope {
  userID: string;
}

export class UserScopedSetting extends BaseSetting<UserScope> {
  transformScope(scope: UserScope) {
    return {
      scope: scope.userID,
    };
  }
}

export interface GuildScope {
  guildID: string;
}

export class GuildScopedSetting extends BaseSetting<GuildScope> {
  transformScope(scope: GuildScope) {
    return {
      scope: scope.guildID,
    };
  }
}

export interface GuildMemberScope {
  guildID: string;
  userID: string;
}

export class GuildMemberScopedSetting extends BaseSetting<GuildMemberScope> {
  transformScope(scope: GuildMemberScope) {
    return {
      scope: scope.guildID,
      secondaryScope: scope.userID,
    };
  }
}

export interface BotScope {}

export class BotScopedSetting extends BaseSetting<BotScope> {
  transformScope(_: BotScope) {
    return {};
  }
}
