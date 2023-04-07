import { DiscordUserArgument } from "../argumentTypes/discord/DiscordUserArgument";
import { UserStringArgument } from "../argumentTypes/UserStringArgument";
import { DiscordIDMention } from "./DiscordIDMention";
import { FriendAliasMention } from "./FriendMention";
import { LastFMMention } from "./LastFMMention";
import { DiscordUsernameMention } from "./UsernameMention";

export const standardMentions = {
  user: new DiscordUserArgument({
    description: "The user to use (defaults to you)",
  }),
  lastfmUsername: new UserStringArgument({
    mention: new LastFMMention(),
    description: "The last.fm username to use (defaults to yours)",
  }),
  userID: new UserStringArgument({
    mention: new DiscordIDMention(),
    description: "The id of the discord user to use",
    // The user argument can take an id, so this is not needed
    slashCommandOption: false,
  }),
  discordUsername: new UserStringArgument({
    mention: new DiscordUsernameMention(),
    description: "The username of the discord user to use",
    // User arguments don't ping with slash commands,
    // so users can just use the `user` argument
    slashCommandOption: false,
  }),
  friendMention: new UserStringArgument({
    mention: new FriendAliasMention(),
    description: "The alias of one of your friends to use",
  }),
};
