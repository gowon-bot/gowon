import { User as DiscordUser } from "discord.js";
import {
  CommandRequiresBackerError,
  MentionedSignInRequiredError,
  MentionedUserNotAuthenticatedError,
  MentionedUserNotIndexedError,
  SenderSignInRequiredError,
  SenderUserNotAuthenticatedError,
  throwSenderUserNotIndexed,
} from "../../../errors/user";
import { isBot } from "../../../helpers/bots";
import { GowonContext } from "../../../lib/context/Context";
import { BaseService } from "../../BaseService";
import { DiscordService } from "../../Discord/DiscordService";
import { isSessionKey } from "../../LastFM/LastFMAPIService";
import { NowPlayingEmbedParsingService } from "../../NowPlayingEmbedParsingService";
import { ServiceRegistry } from "../../ServicesRegistry";
import { FriendsService } from "../../dbservices/FriendsService";
import { UsersService } from "../../dbservices/UsersService";
import { LilacUsersService } from "../../lilac/LilacUsersService";
import { LilacUser } from "../../lilac/converters/user";
import { MentionsBuilder } from "./MentionsBuilder";
import {
  GetMentionsOptions,
  Mentions,
  Requestables,
  argumentKeys,
} from "./MentionsService.types";
export class MentionsService extends BaseService {
  private get nowPlayingEmbedParsingService() {
    return ServiceRegistry.get(NowPlayingEmbedParsingService);
  }
  private get usersService() {
    return ServiceRegistry.get(UsersService);
  }
  private get lilacUsersService() {
    return ServiceRegistry.get(LilacUsersService);
  }
  private get discordService() {
    return ServiceRegistry.get(DiscordService);
  }
  private get friendsService() {
    return ServiceRegistry.get(FriendsService);
  }

  async getMentions(
    ctx: GowonContext,
    inputOptions: Partial<GetMentionsOptions>
  ): Promise<Mentions> {
    const options = Object.assign(this.defaultOptions(), inputOptions);
    const args = ctx.command.parsedArguments as Record<string, unknown>;
    const mentionsBuilder = new MentionsBuilder();

    const discordUsername = args[argumentKeys.discordUsername] as string;

    mentionsBuilder.addLfmUsername(
      "mentioned",
      (args[argumentKeys.lfmMention] || args[options.usernameArgumentKey]) as
        | string
        | undefined
    );

    mentionsBuilder.addUserID("sender", ctx.author.id);
    mentionsBuilder.addUserID(
      "mentioned",
      args[argumentKeys.userID] as string | undefined
    );

    mentionsBuilder.addDiscordUser("sender", ctx.author);
    mentionsBuilder.addDiscordUser(
      "mentioned",
      args[argumentKeys.user] as DiscordUser | undefined
    );

    this.maybeHandleReply(ctx, mentionsBuilder);

    if (discordUsername && !mentionsBuilder.getDiscordUser("mentioned")) {
      mentionsBuilder.addDiscordUser(
        "mentioned",
        await this.discordService.getDiscordUserFromUsername(
          ctx,
          discordUsername
        )
      );
    }

    await this.fetchSenderDBUser(ctx, mentionsBuilder);

    if (args[argumentKeys.friendMention]) {
      const friend = await this.friendsService.getFriendByAlias(
        mentionsBuilder.getDBUser("sender")!,
        args[argumentKeys.friendMention] as string
      );

      if (friend?.friend) {
        mentionsBuilder.addDBUser("mentioned", friend.friend);
      }
    }

    await this.addLastfmUsername(ctx, mentionsBuilder, options);
    await this.reverseLookupDBUser(ctx, mentionsBuilder, options);
    await this.fetchDiscordUser(ctx, mentionsBuilder, options);
    await this.fetchLilacUser(ctx, mentionsBuilder, options);

    const requestables = mentionsBuilder.buildRequestables()!;

    await this.ensureRequiredProperties(
      ctx,
      mentionsBuilder,
      options,
      requestables
    );

    return mentionsBuilder.build(options, requestables);
  }

  private defaultOptions(): GetMentionsOptions {
    return {
      senderRequired: false,
      usernameRequired: true,
      usernameArgumentKey: argumentKeys.username,
      perspectiveAsCode: true,
      fetchDiscordUser: false,
      fetchLilacUser: false,
      reverseLookup: { required: false },
    };
  }

  private async ensureRequiredProperties(
    ctx: GowonContext,
    mentionsBuilder: MentionsBuilder,
    options: GetMentionsOptions,
    requestables: Requestables
  ): Promise<void> {
    if (options.usernameRequired) this.ensureUsername(ctx, mentionsBuilder);
    if (options.senderRequired) this.ensureSender(ctx, mentionsBuilder);
    if (options.indexedRequired) await this.ensureIndexed(ctx, mentionsBuilder);
    if (options.lfmAuthentificationRequired) {
      this.ensureUserAuthenticated(ctx, requestables, mentionsBuilder);
    }
    if (options.backerRequired) {
      this.ensurePremium(ctx, mentionsBuilder);
    }
  }

  private async maybeHandleReply(
    ctx: GowonContext,
    mentionsBuilder: MentionsBuilder
  ) {
    const user = mentionsBuilder.getDiscordUser("mentioned");

    if (ctx.payload.isMessage() && ctx.payload.source.reference && user) {
      const reply = await ctx.payload.source.fetchReference();

      if (this.nowPlayingEmbedParsingService.hasParsableEmbed(reply)) {
        if (
          isBot(user.id, [
            "gowon",
            "gowon development",
            "fmbot",
            "fmbot develop",
            "chuu",
            "who knows",
          ])
        ) {
          const mentionedUser = (Array.from(
            ctx.payload.source.mentions.users
          )[1] || [])[1];

          mentionsBuilder.addDiscordUser("mentioned", mentionedUser);
        }
      }
    }
  }

  private async addLastfmUsername(
    ctx: GowonContext,
    mentionsBuilder: MentionsBuilder,
    options: GetMentionsOptions
  ): Promise<void> {
    const discordID = mentionsBuilder.getDiscordID("mentioned");

    if (discordID) {
      try {
        const mentionedUser = await this.usersService.getUser(ctx, discordID);

        mentionsBuilder.addDBUser("mentioned", mentionedUser);

        if (!mentionedUser?.lastFMUsername && options.usernameRequired) {
          throw new MentionedSignInRequiredError(
            mentionsBuilder.getUserDisplay()
          );
        }

        if (mentionedUser?.lastFMUsername) {
          mentionsBuilder.addLfmUsername(
            "mentioned",
            mentionedUser?.lastFMUsername
          );
        }
      } catch (e) {
        if (options.usernameRequired) {
          throw new MentionedSignInRequiredError(
            mentionsBuilder.getUserDisplay()
          );
        }
      }
    }
  }

  private async fetchSenderDBUser(
    ctx: GowonContext,
    mentionsBuilder: MentionsBuilder
  ): Promise<void> {
    try {
      const senderDBUser = await this.usersService.getUser(
        ctx,
        ctx.payload.author.id
      );
      mentionsBuilder.addDBUser("sender", senderDBUser);
    } catch {}
  }

  private async reverseLookupDBUser(
    ctx: GowonContext,
    mentionsBuilder: MentionsBuilder,
    options: GetMentionsOptions
  ): Promise<void> {
    const mentionedUsername = mentionsBuilder.getLfmUsername("mentioned");

    if (!mentionsBuilder.getDBUser("mentioned") && mentionedUsername) {
      const mentionedDBUser = await this.usersService.getUserFromLastFMUsername(
        ctx,
        mentionedUsername
      );

      mentionsBuilder.addDBUser("mentioned", mentionedDBUser);

      if (
        (options.reverseLookup.required || options.dbUserRequired) &&
        ((mentionsBuilder.hasAnyMentioned() &&
          !mentionsBuilder.getDBUser("mentioned")) ||
          !mentionsBuilder.getDBUser("sender"))
      )
        throw new MentionedSignInRequiredError(mentionedUsername);
    }
  }

  private async fetchDiscordUser(
    ctx: GowonContext,
    mentionsBuilder: MentionsBuilder,
    options: GetMentionsOptions
  ): Promise<void> {
    if (
      options.fetchDiscordUser &&
      !mentionsBuilder.getDiscordUser("mentioned")
    ) {
      try {
        const discordID = mentionsBuilder.getDiscordID("mentioned");

        if (discordID) {
          const fetchedUser = await ctx.client.client.users.fetch(discordID);

          mentionsBuilder.addDiscordUser("mentioned", fetchedUser);
        }
      } catch {}
    }
  }

  private async fetchLilacUser(
    ctx: GowonContext,
    mentionsBuilder: MentionsBuilder,
    options: GetMentionsOptions
  ): Promise<void> {
    if (options.fetchLilacUser) {
      const userPromises: Promise<LilacUser | undefined>[] = [
        this.lilacUsersService.fetch(ctx, { discordID: ctx.author.id }),
      ];

      const discordID = mentionsBuilder.getDiscordID("mentioned");

      if (discordID) {
        userPromises.push(
          this.lilacUsersService.fetch(ctx, { discordID: discordID })
        );
      }

      const users = await Promise.all(userPromises);

      const senderLilacUser = users.find((u) => u?.discordID === ctx.author.id);
      const mentionedLilacUser = users.find((u) => u?.discordID === discordID);

      mentionsBuilder.addLilacUser("sender", senderLilacUser);
      mentionsBuilder.addLilacUser("mentioned", mentionedLilacUser);
    }
  }

  private ensureUsername(
    ctx: GowonContext,
    mentionsBuilder: MentionsBuilder
  ): void | never {
    if (!mentionsBuilder.getLfmUsername("sender")) {
      throw new SenderSignInRequiredError(ctx.command.prefix);
    }
  }

  private ensureSender(
    ctx: GowonContext,
    mentionsBuilder: MentionsBuilder
  ): void | never {
    if (!mentionsBuilder.getLfmUsername("sender")) {
      throw new SenderSignInRequiredError(ctx.command.prefix);
    }
  }

  private async ensureIndexed(
    ctx: GowonContext,
    mentionsBuilder: MentionsBuilder
  ): Promise<void | never> {
    const dbUser = mentionsBuilder.getDBUser();
    const mentionedDbUser = mentionsBuilder.getDBUser("mentioned");
    const senderDbUser = mentionsBuilder.getDBUser("sender");

    if (dbUser && !dbUser.isIndexed) {
      if (dbUser.id === mentionedDbUser?.id) {
        throw new MentionedUserNotIndexedError(ctx.command.prefix);
      } else if (dbUser.id === senderDbUser?.id) {
        if (!senderDbUser.lastFMSession) {
          throw new SenderUserNotAuthenticatedError(ctx.command.prefix);
        }

        await throwSenderUserNotIndexed(ctx);
      }
    } else if (!senderDbUser) {
      throw new SenderSignInRequiredError(ctx.command.prefix);
    } else if (mentionsBuilder.hasAnyMentioned() && !mentionedDbUser) {
      throw new MentionedSignInRequiredError(mentionsBuilder.getUserDisplay());
    }
  }

  private ensureUserAuthenticated(
    ctx: GowonContext,
    requestables: Requestables | undefined,
    mentionsBuilder: MentionsBuilder
  ): void | never {
    if (!isSessionKey(requestables?.requestable)) {
      if (mentionsBuilder.hasAnyMentioned()) {
        throw new MentionedUserNotAuthenticatedError(ctx.command.prefix);
      } else {
        throw new SenderUserNotAuthenticatedError(ctx.command.prefix);
      }
    }
  }

  private ensurePremium(ctx: GowonContext, mentionsBuilder: MentionsBuilder) {
    if (mentionsBuilder.getDBUser()?.hasPremium === false) {
      throw new CommandRequiresBackerError(ctx.command.prefix);
    }
  }
}
