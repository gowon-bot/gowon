import {
  SlashCommandBuilder as _SlashCommandBuilder,
  SlashCommandAttachmentOption,
  SlashCommandBooleanOption,
  SlashCommandChannelOption,
  SlashCommandIntegerOption,
  SlashCommandMentionableOption,
  SlashCommandNumberOption,
  SlashCommandRoleOption,
  SlashCommandStringOption,
  SlashCommandUserOption,
} from "@discordjs/builders";

// Discord.js doesn't export any interfaces to help deal with building slash commands
// so I created them myself

export {
  SlashCommandBooleanOption,
  SlashCommandChannelOption,
  SlashCommandIntegerOption,
  SlashCommandMentionableOption,
  SlashCommandNumberOption,
  SlashCommandRoleOption,
  SlashCommandStringOption,
  SlashCommandUserOption,
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
  | SlashCommandMentionableOption
  | SlashCommandAttachmentOption;

export type SlashCommandBuilder = _SlashCommandBuilder;
export type SlashCommandBuilderReturn =
  | _SlashCommandBuilder
  | Omit<_SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;
