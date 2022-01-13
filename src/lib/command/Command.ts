import { Message } from "discord.js";
import { Arguments } from "../arguments/arguments";
import { GowonClient } from "../GowonClient";
import { CommandAccess } from "./access/access";
import { Variation } from "./BaseCommand";
import { CommandGroup } from "./CommandGroup";
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
  access?: CommandAccess;

  name: string;
  friendlyName: string;
  friendlyNameWithParent?: string;
  description: string;
  category: string | undefined;
  subcategory: string | undefined;
  usage: string | string[];

  delegatedFrom?: Command;

  hasChildren: boolean;
  children?: CommandGroup;
  parentName?: string;
  parent?: ParentCommand;
  gowonClient?: GowonClient;
  getChild(name: string, serverID: string): Promise<Command | undefined>;

  rollout: Rollout;

  copy(): Command;
  setClient(client: GowonClient): void;
}

export interface Rollout {
  users?: string[];
  guilds?: string[];
}
