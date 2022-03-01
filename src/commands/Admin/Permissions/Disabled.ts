import { PermissionsChildCommand } from "../Permissions/PermissionsChildCommand";

export class Disabled extends PermissionsChildCommand {
  idSeed = "red velvet seulgi";

  description = "List all disabled commands";
  usage = "";
  aliases = ["listdisabled", "disabledcommands"];

  async prerun() {}

  async run() {
    let disabledCommands = await this.adminService.listDisabled(this.ctx);

    let embed = this.newEmbed()
      .setTitle(`Disabled commands in ${this.guild?.name}`)
      .setDescription(
        disabledCommands.length
          ? disabledCommands
              .map((dc) => dc.commandFriendlyName.code())
              .join(", ")
          : "This server does not have any disabled commands!"
      );

    await this.send(embed);
  }
}
