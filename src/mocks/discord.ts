// @ts-nocheck

import {
  Client,
  CommandInteraction,
  Guild,
  GuildMember,
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
}

export const mockClient = new MockClient();

export class MockMessage extends Message<true> {
  constructor(public content = "hello world") {
    super(mockClient, {
      id: "831397226604396574",
      channel_id: "768596255697272865",
      guild_id: "768596255697272862",
    });
  }

  get guild() {
    return new MockGuild();
  }

  get author() {
    return new MockUser();
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
    super(mockClient, {});
  }
}

export class MockChannel extends TextChannel {
  id = "768596255697272865";

  constructor() {
    super();
  }
}

export class MockUser extends User {
  constructor() {
    super(mockClient, {
      id: "267794154459889664",
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

export class MockGuildMember extends GuildMember {
  user = new MockUser();

  nickname = "Test User";

  constructor() {
    super();
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
