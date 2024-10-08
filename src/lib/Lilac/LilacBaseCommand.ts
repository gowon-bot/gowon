import { LastFMArguments } from "../../services/LastFM/LastFMArguments";
import { LastFMService } from "../../services/LastFM/LastFMService";
import { ServiceRegistry } from "../../services/ServicesRegistry";
import { Command } from "../command/Command";
import { ArgumentsMap } from "../context/arguments/types";

export abstract class LilacBaseCommand<
  T extends ArgumentsMap = {}
> extends Command<T> {
  public static readonly progressBarWidth = 15;

  // The old Mirrorball commands had a connector field
  // that shouldn't be present on the new Lilac commands
  protected connector?: never;

  lastFMService = ServiceRegistry.get(LastFMService);
  lastFMArguments = ServiceRegistry.get(LastFMArguments);

  readonly syncHelp =
    '"Syncing" means downloading all your Last.fm data. This is required for many commands to function.';
}
