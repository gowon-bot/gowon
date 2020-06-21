import { CommandManager } from "../../../lib/command/CommandManager";
import { LastFMBaseParentCommand } from "../LastFMBaseCommand";
import { AlbumList } from "./AlbumList";
import { ArtistList } from "./ArtistList";
import { TrackList } from "./TrackList";

export default class ListParentCommand extends LastFMBaseParentCommand {
  children = new CommandManager({
    artistlist: () => new ArtistList(),
    albumlist: () => new AlbumList(),
    tracklist: () => new TrackList()
  });
}
