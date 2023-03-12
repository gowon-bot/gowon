import { Setting } from "../../database/entity/Setting";
import { InvalidChoiceError } from "../../errors/settings";

export enum SettingType {
  Text = "text",
  TextShort = "textshort",
  TextLong = "textlong",
  Toggle = "toggle",
  Role = "role",
  Choice = "choice",
  Number = "number",
}

interface SettingOptions {
  friendlyName: string;
  description: string;
  category: string;
  default: string;

  omitFromDashboard: boolean;
  type: SettingType;
  choices: string[];
}

export abstract class BaseSetting<ScopeT = unknown> {
  settingDB = Setting;

  constructor(
    public name: string,
    public options: Partial<SettingOptions> = {}
  ) {}

  async get(scope: ScopeT): Promise<Setting | undefined> {
    let whereClause = { name: this.name };

    whereClause = this.setScopeOnWhere(scope, whereClause);

    return (await this.settingDB.findOneBy(whereClause)) ?? undefined;
  }

  async createUpdateOrDelete(
    scope: ScopeT,
    value?: string
  ): Promise<Setting | undefined> {
    if (value !== undefined) {
      if (this.options.choices && !this.options.choices.includes(value)) {
        throw new InvalidChoiceError(this.options.choices);
      }
    }

    let whereClause = { name: this.name };

    whereClause = this.setScopeOnWhere(scope, whereClause);

    const existingSetting = await this.settingDB.findOne({
      where: whereClause,
    });

    if (existingSetting) {
      if (value === undefined) {
        await this.settingDB.delete(existingSetting.id);

        return undefined;
      } else {
        existingSetting.value = value;
        await existingSetting.save();
        return existingSetting;
      }
    } else if (value !== undefined) {
      const transformedScope = this.transformScope(scope);
      const setting = this.settingDB.create({
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

export type BotScope = Record<string, never>;

export class BotScopedSetting extends BaseSetting<BotScope> {
  transformScope(_scope: BotScope) {
    return {};
  }
}
