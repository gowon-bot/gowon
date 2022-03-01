import { ArgumentsMap } from "../context/arguments/types";
import { Payload } from "../context/Payload";
import { GowonClient } from "../GowonClient";
import { CommandAccess } from "./access/access";
import { Variation } from "./BaseCommand";
import { CommandGroup } from "./CommandGroup";
import { ParentCommand } from "./ParentCommand";
import { RunAs } from "./RunAs";

export interface Command {
  execute(payload: Payload, runAs: RunAs, client: GowonClient): Promise<void>;
  id: string;
  idSeed: string;

  slashCommand?: boolean;
  slashCommandName?: string;

  variations: Variation[];
  aliases: Array<string>;
  arguments: ArgumentsMap;
  secretCommand: boolean;
  archived: boolean;
  shouldBeIndexed: boolean;
  devCommand?: boolean;
  adminCommand?: boolean;
  customHelp?: { new (): Command };
  access?: CommandAccess;

  name: string;
  friendlyName: string;
  friendlyNameWithParent?: string;
  description: string;
  extraDescription: string;
  category: string | undefined;
  subcategory: string | undefined;
  usage: string | string[];

  redirectedFrom?: Command;

  hasChildren: boolean;
  children?: CommandGroup;
  parentName?: string;
  parent?: ParentCommand;
  gowonClient?: GowonClient;
  getChild(name: string, serverID: string): Promise<Command | undefined>;

  rollout: Rollout;

  copy(): Command;
}

export interface Rollout {
  users?: string[];
  guilds?: string[];
}
