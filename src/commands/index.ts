import { Command, NoCommand } from "./Command";
import { Ping } from "./Ping";
import { NowPlaying } from "./NowPlaying";
import { Login } from "./Login";
import { Whoami } from "./Whoami";

interface Commands {
  [key: string]: () => Command;
}

const commands: Commands = {
  ping: () => new Ping(),
  nowplaying: () => new NowPlaying(),
  login: () => new Login(),
  whoami: () => new Whoami(),
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
};
