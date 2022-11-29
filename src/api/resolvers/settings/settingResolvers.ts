import { Guild } from "discord.js";
import {
  CannotEditServerError,
  CannotEditUserError,
} from "../../../errors/gowon";
import { GowonContext } from "../../../lib/context/Context";
import { Settings } from "../../../lib/settings/Settings";
import {
  convertSettingNameToKey,
  SettingsService,
} from "../../../lib/settings/SettingsService";
import {
  BaseSetting,
  GuildMemberScopedSetting,
  GuildScopedSetting,
  SettingType,
  UserScopedSetting,
} from "../../../lib/settings/SettingTypes";
import { toggleValues } from "../../../lib/settings/SettingValues";
import { UsersService } from "../../../services/dbservices/UsersService";
import { ServiceRegistry } from "../../../services/ServicesRegistry";
import { APISetting, APISettingWithValue, SettingValue } from "./types";

const settingsService = ServiceRegistry.get(SettingsService);
const usersService = ServiceRegistry.get(UsersService);

export default (ctx: GowonContext) => ({
  queries: {
    allSettings(_: any, {}: {}) {
      return Object.values(Settings)
        .filter((s) => !s.options.omitFromDashboard)
        .map((s) => convertSetting(s));
    },

    async guildSettings(
      _: any,
      { guildID }: { guildID: string },
      { doughnutID }: { doughnutID: string }
    ) {
      const guild = await ctx.client.client.guilds.fetch(guildID);

      const canAdmin = doughnutID
        ? await ctx.client.canUserAdminGuild(guild, doughnutID)
        : false;

      if (!canAdmin) {
        throw new CannotEditServerError();
      }

      const guildSettings = Object.values(Settings).filter(
        (s) => s instanceof GuildScopedSetting
      );

      const settingValues: APISettingWithValue[] = [];

      for (const setting of filterSettings(guildSettings)) {
        const value = await convertGuildSettingValue(
          setting,
          settingsService.getByName(setting.name, { guildID }),
          guild
        );

        settingValues.push({ setting: convertSetting(setting), value });
      }

      return settingValues;
    },

    async userSettings(
      _: any,
      { userID }: { userID: string },
      { doughnutID }: { doughnutID: string }
    ) {
      const user = await usersService.getUser(ctx, userID);

      if (userID !== doughnutID || !user) {
        throw new CannotEditUserError();
      }

      const userSettings = Object.values(Settings).filter(
        (s) => s instanceof UserScopedSetting
      );

      const settingValues: APISettingWithValue[] = [];

      for (const setting of filterSettings(userSettings)) {
        const value = convertSettingValue(
          setting,
          settingsService.getByName(setting.name, { userID })
        );

        settingValues.push({ setting: convertSetting(setting), value });
      }

      return settingValues;
    },
  },

  mutations: {
    async saveGuildSettings(
      _: any,
      {
        guildID,
        settings,
      }: {
        guildID: string;
        settings: { value: SettingValue; setting: APISetting }[];
      },
      { doughnutID }: { doughnutID: string }
    ) {
      const guild = await ctx.client.client.guilds.fetch(guildID);

      const canAdmin = doughnutID
        ? await ctx.client.canUserAdminGuild(guild, doughnutID)
        : false;

      if (!canAdmin) {
        throw new CannotEditServerError();
      }

      for (const setting of settings) {
        const settingKey = convertSettingNameToKey(setting.setting.name);

        if (settingKey) {
          await settingsService.set(
            ctx,
            settingKey,
            { guildID },
            getValueString(setting.value)
          );
        }
      }
    },
    async saveUserSettings(
      _: any,
      {
        userID,
        settings,
      }: {
        userID: string;
        settings: { value: SettingValue; setting: APISetting }[];
      },
      { doughnutID }: { doughnutID: string }
    ) {
      const user = await usersService.getUser(ctx, userID);

      if (userID !== doughnutID || !user) {
        throw new CannotEditUserError();
      }

      for (const setting of settings) {
        const settingKey = convertSettingNameToKey(setting.setting.name);

        if (settingKey) {
          await settingsService.set(
            ctx,
            settingKey,
            { userID },
            getValueString(setting.value)
          );
        }
      }
    },
  },
});

function convertSetting(setting: BaseSetting): APISetting {
  return {
    name: setting.name,
    category: setting.options.category,
    friendlyName: setting.options.friendlyName!,
    description: setting.options.description!,
    type: setting.options.type!,
    choices: setting.options.choices,
    scope:
      setting instanceof UserScopedSetting
        ? "user"
        : setting instanceof GuildScopedSetting
        ? "guild"
        : setting instanceof GuildMemberScopedSetting
        ? "guildmember"
        : "bot",
  };
}

async function convertGuildSettingValue(
  setting: BaseSetting,
  value: string | undefined,
  guild: Guild
): Promise<SettingValue> {
  if (!value) return {};

  switch (setting.options.type!) {
    case SettingType.Role:
      const role = await guild.roles.fetch(value);

      if (!role) return {};

      return {
        role: {
          id: role.id,
          name: role.name,
          colour: role.hexColor,
        },
      };

    default:
      return convertSettingValue(setting, value);
  }
}

function convertSettingValue(
  setting: BaseSetting,
  value: string | undefined
): SettingValue {
  if (!value) return {};

  switch (setting.options.type!) {
    case SettingType.Text:
    case SettingType.TextLong:
    case SettingType.TextShort:
    case SettingType.Choice:
      return { string: value };

    case SettingType.Number:
      return { number: parseInt(value) };

    case SettingType.Toggle:
      return { boolean: value === "true" || value === toggleValues.ON };

    default:
      break;
  }

  return {};
}

function getValueString(setting: SettingValue): string | undefined {
  if (setting.role) return setting.role.id;
  if (setting.string) return setting.string;
  if (setting.number) return `${setting.number}`;
  if (setting.boolean !== undefined) {
    return setting.boolean ? toggleValues.ON : toggleValues.OFF;
  }

  return undefined;
}

function filterSettings(settings: BaseSetting[]): BaseSetting[] {
  return settings.filter((s) => !s.options.omitFromDashboard);
}
