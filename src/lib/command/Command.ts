import { Message } from "discord.js";
import { Arguments } from "../arguments/arguments";
import { GowonClient } from "../GowonClient";
import { Variation } from "./BaseCommand";
import { CommandManager } from "./CommandManager";
import { ParentCommand } from "./ParentCommand";
import { RunAs } from "./RunAs";

export interface Command {
  execute(message: Message, runAs: RunAs): Promise<void>;
  id: string;
  idSeed: string;

  variations: Variation[];
  aliases: Array<string>;
  arguments: Arguments;
  secretCommand: boolean;
  archived: boolean;
  shouldBeIndexed: boolean;
  devCommand?: boolean;
  customHelp?: { new (): Command };

  name: string;
  friendlyName: string;
  friendlyNameWithParent?: string;
  description: string;
  category: string | undefined;
  subcategory: string | undefined;
  usage: string | string[];

  delegatedFrom?: Command;

  hasChildren: boolean;
  children?: CommandManager;
  parentName?: string;
  parent?: ParentCommand;
  gowonClient?: GowonClient;
  getChild(name: string, serverID: string): Promise<Command | undefined>;

  rollout: Rollout;
}

export interface Rollout {
  users?: string[];
  guilds?: string[];
}
