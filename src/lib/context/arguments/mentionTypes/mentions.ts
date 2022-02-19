import { DiscordUserArgument } from "../argumentTypes/discord/DiscordUserArgument";
import { UserStringArgument } from "../argumentTypes/UserStringArgument";
import { DiscordIDMention } from "./DiscordIDMention";
import { LastFMMention } from "./LastFMMention";
import { DiscordUsernameMention } from "./UsernameMention";

export const standardMentions = {
  user: new DiscordUserArgument(),
  lfmUser: new UserStringArgument({ mention: new LastFMMention() }),
  userID: new UserStringArgument({ mention: new DiscordIDMention() }),
  discordUsername: new UserStringArgument({
    mention: new DiscordUsernameMention(),
  }),
};
