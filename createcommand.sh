#! /bin/zsh

name="${1:-NewCommand}"

filepath="./src/commands/$name.ts"


cat > $filepath << EOM
import { BaseCommand } from "../lib/command/BaseCommand";
import { Arguments } from "../lib/arguments/arguments";

const args = {
  inputs: {},
  mentions: {}
} as const;

export default class $name extends BaseCommand<typeof args> {
  idSeed = "Fill in a unique idSeed here";

  description = "Write a meaningful description here";
  subcategory = "Add a subcategory here";
  usage = "Add some usage hints here";

  arguments: Arguments = args;

  async run() {
    // command code goes here
  }
}
EOM



