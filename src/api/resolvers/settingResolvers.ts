import { Guild } from "discord.js";
import { LogicError } from "../../errors";
import { GowonContext } from "../../lib/context/Context";
import { GowonClient } from "../../lib/GowonClient";
import { Settings } from "../../lib/settings/Settings";
import {
  convertSettingNameToKey,
  SettingsService,
} from "../../lib/settings/SettingsService";
import {
  BaseSetting,
  GuildMemberScopedSetting,
  GuildScopedSetting,
  UserScopedSetting,
} from "../../lib/settings/SettingTypes";
import { ServiceRegistry } from "../../services/ServicesRegistry";

const settingsService = ServiceRegistry.get(SettingsService);

export default (client: GowonClient, ctx: GowonContext) => ({
  queries: {
    allSettings(_: any, {}: {}) {
      return Object.values(Settings)
        .filter((s) => !s.options.omitFromDashboard)
        .map((s) => convertSetting(s));
    },

    async guildSettings(
      _: any,
      { guildID }: { guildID: string; userID: string },
      { doughnutID }: { doughnutID: string }
    ) {
      const guild = await client.client.guilds.fetch(guildID);

      const canAdmin = doughnutID
        ? await client.canUserAdminGuild(guild, doughnutID)
        : false;

      if (!canAdmin) {
        throw new LogicError("You don't have permissions to edit this server");
      }

      const guildSettings = Object.values(Settings).filter(
        (s) => s instanceof GuildScopedSetting
      );

      const settingValues: { value: SettingValue; setting: APISetting }[] = [];

      for (const setting of guildSettings) {
        const value = await convertValue(
          setting,
          settingsService.getByName(setting.name, { guildID }),
          guild
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
      const guild = await client.client.guilds.fetch(guildID);

      const canAdmin = doughnutID
        ? await client.canUserAdminGuild(guild, doughnutID)
        : false;

      if (!canAdmin) {
        throw new LogicError("You don't have permissions to edit this server");
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
  },
});

interface APISetting {
  name: string;
  category: string | undefined;
  friendlyName: string;
  description: string;
  type: string;
  scope: string;
}

interface SettingValue {
  role?: { name: string; id: string; colour: string };
  string?: string;
  boolean?: boolean;
}

function convertSetting(setting: BaseSetting): APISetting {
  return {
    name: setting.name,
    category: setting.options.category,
    friendlyName: setting.options.friendlyName!,
    description: setting.options.description!,
    type: setting.options.type!,
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

async function convertValue(
  setting: BaseSetting,
  value: string | undefined,
  guild: Guild
): Promise<SettingValue> {
  if (!value) return {};

  switch (setting.options.type!) {
    case "role":
      const role = await guild.roles.fetch(value);

      if (!role) return {};

      return {
        role: {
          id: role.id,
          name: role.name,
          colour: role.hexColor,
        },
      };

    case "text":
    case "textlong":
    case "textshort":
      return { string: value };

    case "toggle":
      return { boolean: value === "true" || value === "on" };

    default:
      break;
  }

  return {};
}

function getValueString(setting: SettingValue): string | undefined {
  if (setting.role) return setting.role.id;
  if (setting.string) return setting.string;
  if (setting.boolean !== undefined) {
    return setting.boolean ? "on" : undefined;
  }

  return undefined;
}
