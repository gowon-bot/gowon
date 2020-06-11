import { BaseCommand } from "./Command";
import { Message } from "discord.js";
import { sanitizeForDiscord } from "../helpers/discord";

export class Login extends BaseCommand {
    async run(message: Message) {
        let username = this.extractArgs(message)
        await this.usersService.setUsername(message.author.id, username)

        message.channel.send(`Logged in as \`${sanitizeForDiscord(username)}\``)
    }
}