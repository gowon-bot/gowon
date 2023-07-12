import { BaseChildCommand } from "../../lib/command/ParentCommand";
import { ArgumentsMap } from "../../lib/context/arguments/types";
import { ServiceRegistry } from "../../services/ServicesRegistry";
import { CommunityPlaylistService } from "../../services/communityPlaylists/CommunityPlaylistService";

export abstract class CommunityPlaylistChildCommand<
  T extends ArgumentsMap = {}
> extends BaseChildCommand<T> {
  parentName = "community playlists";
  subcategory = "community playlists";

  slashCommand = true;

  communityPlaylistService = ServiceRegistry.get(CommunityPlaylistService);
}
