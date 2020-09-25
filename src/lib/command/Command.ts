import { Message } from "discord.js";
import { RunAs } from "../AliasChecker";
import { Arguments } from "../arguments/arguments";
import { GowonClient } from "../GowonClient";
import { Variation } from "./BaseCommand";
import { CommandManager } from "./CommandManager";
import { ParentCommand } from "./ParentCommand";

export interface Command {
  execute(message: Message, runAs: RunAs): Promise<void>;
  id: string;

  variations: Variation[];
  aliases: Array<string>;
  arguments: Arguments;
  secretCommand: boolean;
  shouldBeIndexed: boolean;

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
  client?: GowonClient;
  getChild(name: string, serverID: string): Promise<Command | undefined>;
}
