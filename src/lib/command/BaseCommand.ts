import {
  Guild,
  Message,
  MessageEmbed,
  MessageResolvable,
  User as DiscordUser,
} from "discord.js";
import md5 from "js-md5";
import { UsersService } from "../../services/dbservices/UsersService";
import { Arguments, ArgumentParser } from "../arguments/arguments";
import {
  LogicError,
  MentionedUserNotIndexedError,
  LastFMReverseLookupError,
  SenderUserNotIndexedError,
  UnknownError,
  UsernameNotRegisteredError,
} from "../../errors";
import { GowonService } from "../../services/GowonService";
import { CommandGroup } from "./CommandGroup";
import { Logger } from "../Logger";
import { Command, Rollout } from "./Command";
import { TrackingService } from "../../services/TrackingService";
import { User } from "../../database/entity/User";
import { Perspective } from "../Perspective";
import { GowonClient } from "../GowonClient";
import { Validation, ValidationChecker } from "../validation/ValidationChecker";
import { Emoji, EmojiRaw } from "../Emoji";
import { Argument, Mention } from "./ArgumentType";
import { RunAs } from "./RunAs";
import { ucFirst } from "../../helpers";
import { checkRollout } from "../../helpers/permissions";
import { errorEmbed, gowonEmbed } from "../views/embeds";
import {
  isSessionKey,
  Requestable,
} from "../../services/LastFM/LastFMAPIService";
import {
  buildRequestables,
  compareUsernames,
} from "../../helpers/parseMentions";
import { MirrorballService } from "../../services/mirrorball/MirrorballService";
import { Chance } from "chance";
import {
  MirrorballUser,
  UserInput,
} from "../../services/mirrorball/MirrorballTypes";
import { MirrorballUsersService } from "../../services/mirrorball/services/MirrorballUsersService";
import { CommandRegistry } from "./CommandRegistry";
import { ServiceRegistry } from "../../services/ServicesRegistry";
import { SimpleMap } from "../../helpers/types";

export interface Variation {
  name: string;
  variation: string[] | string;
  description?: string;
}

export interface Delegate<T> {
  delegateTo: { new (): Command };
  when(args: ParsedArguments<T>): boolean;
}

type ArgumentName<T extends Arguments> =
  | keyof T["inputs"]
  | keyof T["mentions"];

export type ParsedArguments<T extends Arguments> = {
  [K in keyof T["inputs"]]?: Argument<T["inputs"][K]>;
} &
  {
    [K in keyof T["mentions"]]?: Mention<T["mentions"][K]>;
  } &
  {
    [K in keyof T["flags"]]: boolean;
  };

export abstract class BaseCommand<ArgumentsType extends Arguments = Arguments>
  implements Command
{
  /**
   * idSeed is the seed for the generated command id
   * **Must be unique among all commands!**
   */
  abstract idSeed: string;

  logger = new Logger();

  name: string = this.constructor.name.toLowerCase();
  friendlyName: string = this.constructor.name.toLowerCase();
  aliases: Array<string> = [];
  variations: Variation[] = [];
  description: string = "No description for this command";
  secretCommand: boolean = false;

  // Archived are commands that can't be run, but stick around for data purposes
  // Should be used to 'decommission' commands that aren't needed anymore
  archived = false;
  shouldBeIndexed: boolean = true;
  devCommand: boolean = false;
  customHelp?: { new (): Command } | undefined;

  arguments: Arguments = {};
  validation: Validation = {};

  // Has to be any typed because the parsed flags aren't optionally typed
  // because they always will be either true or false
  // this is set by the FlagParser when this.parseArguments() is called
  parsedArguments: ParsedArguments<ArgumentsType> = {} as any;

  category: string | undefined = undefined;
  subcategory: string | undefined = undefined;
  usage: string | string[] = "";

  delegates: Delegate<ArgumentsType>[] = [];
  delegatedFrom?: Command;

  message!: Message;
  runAs!: RunAs;
  guild!: Guild;
  author!: DiscordUser;
  gowonClient!: GowonClient;

  responses: Array<MessageEmbed | string> = [];

  showLoadingAfter?: number;
  isCompleted = false;

  rollout: Rollout = {};

  get friendlyNameWithParent(): string {
    return (
      (this.parentName ? this.parentName.trim() + " " : "") + this.friendlyName
    );
  }

  commandRegistry = CommandRegistry.getInstance();

  track = ServiceRegistry.get(TrackingService);
  usersService = ServiceRegistry.get(UsersService);
  gowonService = ServiceRegistry.get(GowonService);
  mirrorballService = ServiceRegistry.get(MirrorballService);
  mirrorballUsersService = ServiceRegistry.get(MirrorballUsersService);

  hasChildren = false;
  children?: CommandGroup;
  parentName?: string;

  ctx = this.generateContext({});

  generateContext(customContext: SimpleMap): any {
    return Object.assign(
      {
        logger: this.logger,
        command: this,
      },
      customContext
    );
  }

  async getChild(_: string, __: string): Promise<Command | undefined> {
    return undefined;
  }

  get id(): string {
    return md5(this.idSeed);
  }

  get prefix(): string {
    return this.gowonService.prefix(this.guild.id);
  }

  abstract run(message: Message, runAs: RunAs): Promise<void>;

  async parseMentions({
    senderRequired = false,
    usernameRequired = true,
    userArgumentName = "user" as ArgumentName<ArgumentsType>,
    inputArgumentName = "username" as ArgumentName<ArgumentsType>,
    lfmMentionArgumentName = "lfmUser" as ArgumentName<ArgumentsType>,
    idMentionArgumentName = "userID" as ArgumentName<ArgumentsType>,
    asCode = true,
    fetchDiscordUser = false,
    fetchMirrorballUser = false,
    reverseLookup = { required: false },
    authentificationRequired,
    requireIndexed,
  }: {
    senderRequired?: boolean;
    usernameRequired?: boolean;
    userArgumentName?: ArgumentName<ArgumentsType>;
    inputArgumentName?: ArgumentName<ArgumentsType>;
    lfmMentionArgumentName?: ArgumentName<ArgumentsType>;
    idMentionArgumentName?: ArgumentName<ArgumentsType>;
    asCode?: boolean;
    fetchDiscordUser?: boolean;
    fetchMirrorballUser?: boolean;
    reverseLookup?: { required?: boolean };
    authentificationRequired?: boolean;
    requireIndexed?: boolean;
  } = {}): Promise<{
    senderUsername: string;
    senderRequestable: Requestable;

    username: string;
    requestable: Requestable;

    mentionedUsername?: string;
    perspective: Perspective;

    mentionedDBUser?: User;
    senderUser?: User;
    dbUser: User;
    discordUser?: DiscordUser;

    senderMirrorballUser?: MirrorballUser;
    mirrorballUser?: MirrorballUser;
  }> {
    let user = this.parsedArguments[userArgumentName] as any as User,
      userID = this.parsedArguments[idMentionArgumentName] as any as string,
      lfmUser = this.parsedArguments[lfmMentionArgumentName] as any as string,
      discordUsername = (this.parsedArguments as any)[
        "discordUsername"
      ] as string;

    let mentionedUsername: string | undefined;
    let discordUser: DiscordUser | undefined;

    let senderDBUser: User | undefined;
    let mentionedDBUser: User | undefined;

    let senderMirrorballUser: MirrorballUser | undefined;
    let mentionedMirrorballUser: MirrorballUser | undefined;

    if (discordUsername) {
      discordUser = (await this.guild.members.fetch()).find(
        (member) =>
          member.user.username.toLowerCase() === discordUsername ||
          member.nickname?.toLowerCase() === discordUsername
      )?.user;
    }

    try {
      senderDBUser = await this.usersService.getUser(
        this.ctx,
        this.message.author.id
      );
    } catch {}

    if (lfmUser) {
      mentionedUsername = lfmUser;
    } else if (user?.id || userID || discordUser) {
      try {
        const mentionedUser = await this.usersService.getUser(
          this.ctx,
          discordUser?.id || userID || `${user?.id}`
        );

        mentionedDBUser = mentionedUser;

        if (!mentionedUser?.lastFMUsername && usernameRequired) {
          throw new UsernameNotRegisteredError();
        }

        mentionedUsername = mentionedUser?.lastFMUsername;
      } catch {
        if (usernameRequired) throw new UsernameNotRegisteredError();
      }
    } else if (inputArgumentName && this.parsedArguments[inputArgumentName]) {
      mentionedUsername = this.parsedArguments[
        inputArgumentName
      ] as any as string;
    }

    const perspective = this.usersService.perspective(
      senderDBUser?.lastFMUsername || "<no user>",
      mentionedUsername,
      asCode
    );

    if (!mentionedDBUser && mentionedUsername) {
      mentionedDBUser = await this.usersService.getUserFromLastFMUsername(
        this.ctx,
        mentionedUsername
      );

      if (reverseLookup.required && !mentionedDBUser)
        throw new LastFMReverseLookupError(
          mentionedUsername,
          requireIndexed,
          this.prefix
        );
    }

    const username = mentionedUsername || senderDBUser?.lastFMUsername;

    if (fetchDiscordUser) {
      let fetchedUser: DiscordUser | undefined;

      try {
        fetchedUser = await this.gowonClient.client.users.fetch(
          mentionedDBUser?.discordID || userID || this.author.id
        );
      } catch {}

      if (
        fetchedUser &&
        (compareUsernames(username, senderDBUser?.lastFMUsername) ||
          (compareUsernames(username, mentionedDBUser?.lastFMUsername) &&
            mentionedDBUser?.discordID === fetchedUser.id) ||
          userID === fetchedUser.id)
      ) {
        discordUser = fetchedUser;

        perspective.addDiscordUser(discordUser);
      } else discordUser = undefined;
    }

    if (fetchMirrorballUser) {
      const inputs: UserInput[] = [{ discordID: this.author.id }];

      const mentionedID =
        mentionedDBUser?.discordID || discordUser?.id || userID;

      if (mentionedID) {
        inputs.push({ discordID: mentionedID });
      }

      [senderMirrorballUser, mentionedMirrorballUser] =
        (await this.mirrorballUsersService.getMirrorballUser(
          this.ctx,
          inputs
        )) || [];
    }

    if (
      usernameRequired &&
      (!username || (senderRequired && !senderDBUser?.lastFMUsername))
    ) {
      throw new LogicError(
        `please sign in with a last.fm account! (\`${this.prefix}login\`)`,
        `Don't have a one? You can create one at https://last.fm/join`
      );
    }

    const requestables = buildRequestables({
      senderUser: senderDBUser,
      mentionedUsername,
      mentionedUser: mentionedDBUser,
    });

    if (authentificationRequired && !isSessionKey(requestables?.requestable)) {
      throw new LogicError(
        `This command requires you to be authenticated, please login in again! (\`${this.prefix}login\`)`
      );
    }

    const dbUser = mentionedDBUser || senderDBUser;

    if (requireIndexed && dbUser && !dbUser.isIndexed) {
      if (dbUser.id === mentionedDBUser?.id) {
        throw new MentionedUserNotIndexedError(this.prefix);
      } else if (dbUser.id === senderDBUser?.id) {
        throw new SenderUserNotIndexedError(this.prefix);
      }
    }

    const mirrorballUser =
      (mentionedMirrorballUser?.username?.toLowerCase() ===
      mentionedUsername?.toLowerCase()
        ? mentionedMirrorballUser
        : undefined) || (!mentionedUsername ? senderMirrorballUser : undefined);

    return {
      mentionedUsername,
      perspective,
      mentionedDBUser,
      senderUser: senderDBUser,
      discordUser,
      dbUser: dbUser!,
      senderMirrorballUser,
      mirrorballUser,
      ...requestables!,
    };
  }

  async prerun(): Promise<void> {}

  async setup() {
    this.startTyping();
    this.logger.openCommandHeader(this);

    if (this.showLoadingAfter) {
      setTimeout(() => {
        if (!this.isCompleted) {
          this.message.react(Emoji.loading);
        }
      }, this.showLoadingAfter * 1000);
    }
    if (Chance().bool({ likelihood: 33 })) {
      this.usersService
        .getUser(this.ctx, this.author.id)
        .then(async (senderUser) => {
          if (
            senderUser &&
            !["update", "index", "login", "logout"].includes(this.name)
          ) {
            await Promise.all([
              this.mirrorballService.quietAddUserToGuild(this.ctx),
              senderUser.mirrorballUpdate(),
            ]);
          }
        })
        .catch();
    }
  }

  async teardown() {
    this.logger.closeCommandHeader(this);
    this.isCompleted = true;

    if (this.showLoadingAfter) {
      this.message.reactions
        .resolve(EmojiRaw.loading)
        ?.users.remove(this.gowonClient.client.user!);
    }
  }

  async execute(message: Message, runAs: RunAs) {
    this.message = message;
    this.runAs = runAs;
    this.guild = message.guild!;
    this.author = message.author;

    if (!this.checkRollout()) {
      return;
    }

    await this.setup();

    try {
      this.parsedArguments = this.parseArguments(runAs) as any;

      for (let delegate of this.delegates) {
        if (delegate.when(this.parsedArguments)) {
          let command = new delegate.delegateTo();
          command.gowonClient = this.gowonClient;
          command.delegatedFrom = this;
          await command.execute(message, runAs);
          return;
        }
      }

      this.logger.logCommand(this, message, runAs.toArray().join(" "));

      new ValidationChecker(this.parsedArguments, this.validation).validate();

      await this.prerun();
      await this.run(message, runAs);
    } catch (e) {
      this.logger.logError(e);
      this.track.error(this.ctx, e);

      if (e.isClientFacing && !e.silent) {
        await this.sendError(e.message, e.footer);
      } else if (!e.isClientFacing) {
        await this.sendError(new UnknownError().message);
      }
    }

    await this.teardown();
  }

  parseArguments(runAs: RunAs): ParsedArguments<ArgumentsType> {
    let parser = new ArgumentParser(this.arguments);

    return parser.parse(this.message, runAs) as ParsedArguments<ArgumentsType>;
  }

  addResponse(res: MessageEmbed | string) {
    this.responses.push(res);
  }

  async sendWithFiles(content: MessageEmbed | string, files: [string]) {
    this.addResponse(content);

    if (typeof content === "string") {
      await this.message.channel.send({ content, files });
    } else {
      await this.message.channel.send({ embeds: [content], files });
    }
  }

  async send(
    content: MessageEmbed | string,
    withEmbed?: MessageEmbed
  ): Promise<Message> {
    this.addResponse(content);

    if (withEmbed) {
      return await this.message.channel.send({
        content: content as string,
        embeds: [withEmbed],
      });
    }

    if (typeof content === "string") {
      return await this.message.channel.send({ content });
    } else {
      return await this.message.channel.send({ embeds: [content] });
    }
  }

  async reply(
    content: string,
    settings: {
      to?: MessageResolvable;
      ping?: boolean;
    } = {}
  ): Promise<Message> {
    const settingsWithDefaults = Object.assign({ ping: false }, settings);

    content = typeof content === "string" ? ucFirst(content) : content;

    this.addResponse(content);

    return await this.message.channel.send({
      content,
      reply: {
        messageReference: settingsWithDefaults.to || this.message,
      },
      allowedMentions: { repliedUser: settingsWithDefaults.ping },
    });
  }

  async traditionalReply(message: string): Promise<Message> {
    this.addResponse(message);
    return await this.message.channel.send(
      `<@!${this.author.id}>, ` + message.trimStart()
    );
  }

  checkRollout(): boolean {
    if (this.gowonClient.isDeveloper(this.author.id)) return true;

    return checkRollout(this.rollout, this.message);
  }

  public copy(): Command {
    return CommandRegistry.getInstance().make(this.id);
  }

  protected async fetchUsername(id: string): Promise<string> {
    try {
      let member = await this.guild.members.fetch(id);
      return member.user.username;
    } catch {
      return this.gowonService.constants.unknownUserDisplay;
    }
  }

  protected newEmbed(embed?: MessageEmbed): MessageEmbed {
    return gowonEmbed(this.message.member ?? undefined, embed);
  }

  protected generateEmbedAuthor(title?: string): [string, string | undefined] {
    return [
      title
        ? `${this.message.author.tag} | ${title}`
        : `${this.message.author.tag}`,
      this.message.author.avatarURL() || undefined,
    ];
  }

  protected async serverUserIDs({
    filterCrownBannedUsers,
  }: { filterCrownBannedUsers?: boolean } = {}): Promise<string[]> {
    let filter = (_: string) => true;

    if (filterCrownBannedUsers) {
      let crownBannedUsers = await this.gowonService.getCrownBannedUsers(
        this.guild
      );

      let purgatoryRole = await this.gowonService.getPurgatoryRole(this.guild);

      let usersInPurgatory = purgatoryRole
        ? (await this.guild.members.fetch())
            .filter((m) => m.roles.cache.has(purgatoryRole!))
            .map((m) => m.user.id)
        : [];

      filter = (id: string) => {
        return !crownBannedUsers.includes(id) && !usersInPurgatory.includes(id);
      };
    }

    return (await this.guild.members.fetch())
      .map((u) => u.user.id)
      .filter(filter);
  }

  protected variationWasUsed(...names: string[]): boolean {
    for (let variation of this.variations.filter((v) =>
      names.includes(v.name)
    )) {
      const variations =
        variation.variation instanceof Array
          ? variation.variation
          : [variation.variation];

      if (variations.find((v) => this.runAs.variationWasUsed(v))) return true;
    }

    return false;
  }

  protected async sendError(message: string, footer = "") {
    const embed = errorEmbed(this.newEmbed(), this.author, message, footer);

    await this.send(embed);
  }

  protected get scopes() {
    const guild = { guildID: this.guild.id };
    const user = { userID: this.author.id };
    const guildMember = Object.assign(guild, user);

    return { guild, user, guildMember };
  }

  protected startTyping() {
    // Sometimes Discord throws 500 errors on this call
    // To reduce the amount of errors when discord is crashing
    // this is try / caught
    try {
      this.message.channel.sendTyping();
    } catch {}
  }
}
