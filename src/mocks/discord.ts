// @ts-nocheck

import {
  Client,
  ClientUser,
  CommandInteraction,
  Guild,
  GuildMember,
  GuildMemberRoleManager,
  Message,
  TextChannel,
  User,
} from "discord.js";

export class MockClient extends Client {
  constructor() {
    super({
      intents: [],
    });
  }

  get user(): ClientUser {
    return new MockClientUser();
  }

  set user(user: ClientUser) {
    return;
  }
}

export const mockClient = new MockClient();

interface MockMessageOptions {
  authorID?: string;
  guild?: Guild;
}

export class MockMessage extends Message<true> {
  private options: MockMessageOptions;

  private providedGuild?: Guild;

  constructor(
    public content = "hello world",
    options: MockMessageOptions = {}
  ) {
    super(mockClient, {
      id: "831397226604396574",
      channel_id: "768596255697272865",
      guild_id: options.guild?.id || "768596255697272862",
    });

    this.options = options;
    this.providedGuild = options.guild;
  }

  get guild() {
    return this.providedGuild || new MockGuild();
  }

  get author() {
    return new MockUser(this.options?.authorID);
  }

  get member() {
    return new MockGuildMember({ user: this.author });
  }
}

export class MockGuildlessMessage extends MockMessage {
  constructor(public content = "hello world") {
    super(content);
  }

  get guild() {
    return null;
  }
}

export class MockGuild extends Guild {
  id = "768596255697272862";

  constructor() {
    super(mockClient, { id: "768596255697272862" });
  }
}

export class MockChannel extends TextChannel {
  id = "768596255697272865";

  constructor() {
    super();
  }
}

export class MockUser extends User {
  constructor(id?: string) {
    super(mockClient, {
      id: id || "537353774205894676",
      bot: false,
    });
  }

  get username() {
    return "testuser";
  }
  get discriminator() {
    return "0001";
  }
  get tag() {
    return "testuser#0001";
  }
}

export class MockClientUser extends ClientUser {
  constructor() {
    super(mockClient, {
      id: "772733819089846323",
    });
  }

  get username() {
    return "gowon";
  }
  get discriminator() {
    return "0001";
  }
  get tag() {
    return "gowon#0001";
  }
}

interface MockGuildMemberOptions {
  user: User;
}

export class MockGuildMember extends GuildMember {
  nickname = "Test User";

  constructor(private options: MockGuildMemberOptions = {}) {
    super({
      guilds: [MockGuild],
    });
  }

  get user() {
    return this.options.user || new MockUser();
  }

  get roles() {
    return new MockGuildMemberRoleManager(this);
  }
}

export class MockCommandInteraction extends CommandInteraction {
  constructor() {
    super(mockClient, {
      data: {},
      user: {},
    });
  }
}

export class MockGuildMemberRoleManager extends GuildMemberRoleManager {
  constructor(member?: GuildMember) {
    super(member || new MockGuildMember());
  }

  get cache() {
    return [];
  }
}
