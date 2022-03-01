import {
  SlashCommandBuilder as _SlashCommandBuilder,
  SlashCommandRoleOption,
  SlashCommandUserOption,
  SlashCommandNumberOption,
  SlashCommandStringOption,
  SlashCommandBooleanOption,
  SlashCommandChannelOption,
  SlashCommandIntegerOption,
  SlashCommandMentionableOption,
} from "@discordjs/builders";

// Discord.js doesn't export any interfaces to help deal with building slash commands
// so I created them myself

export {
  SlashCommandRoleOption,
  SlashCommandUserOption,
  SlashCommandNumberOption,
  SlashCommandStringOption,
  SlashCommandBooleanOption,
  SlashCommandChannelOption,
  SlashCommandIntegerOption,
  SlashCommandMentionableOption,
};

// Any type of slash command option
export type SlashCommandOption =
  | SlashCommandRoleOption
  | SlashCommandUserOption
  | SlashCommandNumberOption
  | SlashCommandStringOption
  | SlashCommandBooleanOption
  | SlashCommandChannelOption
  | SlashCommandIntegerOption
  | SlashCommandMentionableOption;

export type SlashCommandBuilder = _SlashCommandBuilder;
export type SlashCommandBuilderReturn =
  | _SlashCommandBuilder
  | Omit<_SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;
