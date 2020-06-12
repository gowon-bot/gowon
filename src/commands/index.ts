import { Command, NoCommand } from "../BaseCommand";
import { Ping } from "./Ping";
import { NowPlaying } from "./NowPlaying";
import { Login } from "./Login";
import { Whoami } from "./Whoami";
import { Github } from "./Github";
import { Help } from "./Help";
import { TrackPlays } from "./TrackPlays";
import { ProfilePic } from "./ProfilePic";
import { ArtistPlays } from "./ArtistPlays";
import { AlbumPlays } from "./AlbumPlays";

interface Commands {
  [key: string]: () => Command;
}

const commands: Commands = {
  ping: () => new Ping(),
  nowplaying: () => new NowPlaying(),
  login: () => new Login(),
  whoami: () => new Whoami(),
  github: () => new Github(),
  help: () => new Help(),
  trackplays: () => new TrackPlays(),
  profilepic: () => new ProfilePic(),
  artistplays: () => new ArtistPlays(),
  albumplays: () => new AlbumPlays(),
};

export default {
  find(commandName: string): Command {
    if (Object.keys(commands).includes(commandName.toLowerCase())) {
      return commands[commandName.toLowerCase()]();
    } else {
      for (let commandKey of Object.keys(commands)) {
        let command = commands[commandKey.toLowerCase()]();

        if (command.hasAlias(commandName)) {
          return command;
        }
      }
    }
    return new NoCommand();
  },
  list(showSecret: boolean): Command[] {
    let commandsList = Object.values(commands).sort();

    return showSecret
      ? commandsList.map((c) => c())
      : commandsList.map((c) => c()).filter((c) => !c.secretCommand);
  },
};
