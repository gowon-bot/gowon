import { BaseCommand } from "./Command";
import { Message } from "discord.js";

export class Ping extends BaseCommand {
    aliases = ["🏓"]

    async run(message: Message) {
        await message.reply("Pong 🏓")
    }
}