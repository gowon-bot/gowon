import { DB } from "../database";
import MockDiscord from "./MockDiscord";
import { UsersService } from "../services/dbservices/UsersService";
import { BaseCommand } from "../lib/command/BaseCommand";
import { Message } from "discord.js";
import { Logger } from "../lib/Logger";
import { RunAs } from "../lib/command/RunAs";

export class FakeLogger {
  header: string = "";

  log(..._: unknown[]) {}
  logCommandHandlerSearch(..._: unknown[]) {}
  logCommandHandle(..._: unknown[]) {}
  openCommandHeader(..._: unknown[]) {}
  closeCommandHeader(..._: unknown[]) {}
  logError(..._: unknown[]) {}
  logCommand(..._: unknown[]) {}
}

export class MockGowon {
  discord = new MockDiscord();
  usersService = new UsersService();
  db = new DB();

  private static instance: MockGowon;

  private constructor() {}

  public static getInstance(): MockGowon {
    if (!this.instance) {
      this.instance = new MockGowon();
    }
    return this.instance;
  }

  async setup() {
    Logger.output = false;

    await this.db.connectTest();
    await this.signInUser();
  }

  async teardown() {
    // await this.db.close(); // broken, see implementation
    await this.signOutUser();
  }

  async signInUser() {
    let user = this.discord.getUser();

    await this.usersService.setUsername(user.id, "flushed_emoji");
  }

  async signOutUser() {
    let user = this.discord.getUser();

    try {
      await this.usersService.clearUsername(user.id);
    } catch {}
  }

  command<T extends BaseCommand>(command: T): T {
    command.send = async (msg) => {
      command.addResponse(msg);
      return this.discord.getMessage();
    };

    command.reply = async (msg) => {
      command.addResponse(msg);
      return this.discord.getMessage();
    };

    command.sendWithFiles = async (msg, _) => {
      command.addResponse(msg);
    };

    command.setup = async () => {};
    command.teardown = async () => {};

    return command;
  }

  get runAs(): RunAs {
    return new RunAs();
  }

  message(msg = ""): Message {
    return this.discord.getMessage(msg);
  }
}
