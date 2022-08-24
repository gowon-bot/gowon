import { LastFMArguments } from "../../services/LastFM/LastFMArguments";
import { LastFMService } from "../../services/LastFM/LastFMService";
import { ServiceRegistry } from "../../services/ServicesRegistry";
import { Command } from "../command/Command";
import { ArgumentsMap } from "../context/arguments/types";

export abstract class LilacBaseCommand<
  T extends ArgumentsMap = {}
> extends Command<T> {
  protected readonly progressBarWidth = 15;

  lastFMService = ServiceRegistry.get(LastFMService);
  lastFMArguments = ServiceRegistry.get(LastFMArguments);

  readonly indexingHelp =
    '"Indexing" means downloading all your last.fm data. This is required for many commands to function.';
}
