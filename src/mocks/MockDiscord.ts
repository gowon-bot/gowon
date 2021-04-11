// Credit to @mirkoRainer and @TotomInc on GitHub for this file

import {
  Client,
  Guild,
  Channel,
  GuildChannel,
  TextChannel,
  User,
  GuildMember,
  Message,
} from "discord.js";

export default class MockDiscord {
  private client!: Client;
  private guild!: Guild;
  private channel!: Channel;
  private guildChannel!: GuildChannel;
  private textChannel!: TextChannel;
  private user!: User;
  private guildMember!: GuildMember;
  public message!: Message;

  constructor() {
    this.mockClient();
    this.mockGuild();
    this.mockChannel();
    this.mockGuildChannel();
    this.mockTextChannel();
    this.mockUser();
    this.mockGuildMember();
    this.guild.members.add({ user: this.user });
    this.mockMessage();
  }

  public getClient(): Client {
    return this.client;
  }

  public getGuild(): Guild {
    return this.guild;
  }

  public getChannel(): Channel {
    return this.channel;
  }

  public getGuildChannel(): GuildChannel {
    return this.guildChannel;
  }

  public getTextChannel(): TextChannel {
    return this.textChannel;
  }

  public getUser(): User {
    return this.user;
  }

  public getGuildMember(): GuildMember {
    return this.guildMember;
  }

  public getMessage(content: string = ""): Message {
    this.message.content = content;
    return this.message;
  }

  private mockClient(): void {
    this.client = new Client({ intents: [] });
  }

  private mockGuild(): void {
    this.guild = new Guild(this.client, {
      unavailable: false,
      id: "guild-id",
      name: "mocked js guild",
      icon: "mocked guild icon url",
      splash: "mocked guild splash url",
      region: "eu-west",
      member_count: 42,
      large: false,
      features: [],
      application_id: "application-id",
      afkTimeout: 1000,
      afk_channel_id: "afk-channel-id",
      system_channel_id: "system-channel-id",
      embed_enabled: true,
      verification_level: 2,
      explicit_content_filter: 3,
      mfa_level: 8,
      joined_at: new Date("2018-01-01").getTime(),
      owner_id: "owner-id",
      channels: [],
      roles: [],
      presences: [],
      voice_states: [],
      emojis: [],
    });
  }

  private mockChannel(): void {
    this.channel = new Channel(this.client, {
      id: "channel-id",
    });
  }

  private mockGuildChannel(): void {
    this.guildChannel = new GuildChannel(this.guild, {
      ...this.channel,

      name: "guild-channel",
      position: 1,
      parent_id: "123456789",
      permission_overwrites: [],
    });
  }

  private mockTextChannel(): void {
    this.textChannel = new TextChannel(this.guild, {
      ...this.guildChannel,

      topic: "topic",
      nsfw: false,
      last_message_id: "123456789",
      lastPinTimestamp: new Date("2019-01-01").getTime(),
      rate_limit_per_user: 0,
    });
  }

  private mockUser(): void {
    this.user = new User(this.client, {
      id: "user-id",
      username: "user username",
      discriminator: "user#0000",
      avatar: "user avatar url",
      bot: false,
    });
  }

  private mockGuildMember(): void {
    this.guildMember = new GuildMember(
      this.client,
      {
        deaf: false,
        mute: false,
        self_mute: false,
        self_deaf: false,
        session_id: "session-id",
        channel_id: "channel-id",
        nick: "nick",
        joined_at: new Date("2020-01-01").getTime(),
        user: this.user,
        roles: [],
      },
      this.guild
    );
  }

  private mockMessage(): void {
    this.message = new Message(
      this.client,
      {
        id: "message-id",
        type: "DEFAULT",
        content: "this is the message content",
        author: this.user,
        webhook_id: null,
        member: this.guildMember,
        pinned: false,
        tts: false,
        nonce: "nonce",
        embeds: [],
        attachments: [],
        edited_timestamp: null,
        reactions: [],
        mentions: [],
        mention_roles: [],
        mention_everyone: [],
        hit: false,
      },
      this.textChannel
    );
  }
}
