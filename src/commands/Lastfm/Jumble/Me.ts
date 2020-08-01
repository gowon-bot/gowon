import { JumbleChildCommand } from "./JumbleChildCommand";
import { Message, MessageEmbed } from "discord.js";
import { LogicError } from "../../../errors";
import { numberDisplay, shuffle } from "../../../helpers";
import { JumbledArtist, jumbleRedisKey } from "./JumbleParentCommand";
import { Arguments } from "../../../lib/arguments/arguments";

export class Me extends JumbleChildCommand {
  description = "Picks an artist from your library to jumble";

  arguments: Arguments = {
    inputs: {
      poolAmount: { index: 0, regex: /[0-9]{1,4}/g },
    },
  };

  async run(message: Message) {
    let alreadyJumbled = await this.sessionGetJSON<JumbledArtist>(
      message,
      jumbleRedisKey
    );

    if (alreadyJumbled.jumbled) {
      this.handleAlreadyJumbled(message, alreadyJumbled);
      return;
    }

    let poolAmount = this.parsedArguments.poolAmount?.toInt() || 500;

    if (poolAmount < 5 || poolAmount > 1000)
      throw new LogicError("Please enter a number between 5 and 1000!");

    let artist = await this.jumbleCalculator.getArtist(poolAmount);

    if (!artist)
      throw new LogicError("No suitable artists were found in your library!");

    let jumbledArtist: JumbledArtist = {
      jumbled: this.jumble(artist.name),
      unjumbled: artist.name,
      currenthint: artist.name.replace(/[^\s]/g, "_"),
    };

    this.sessionSetJSON(message, jumbleRedisKey, jumbledArtist);

    let embed = new MessageEmbed()
      .setAuthor(
        `Jumble for ${message.member?.nickname}`,
        message.author.avatarURL() ?? ""
      )
      .setDescription(
        `**Who is this artist?**
      
      ${jumbledArtist.jumbled.code()}
      
      Hints:
      You've scrobbled them ${numberDisplay(
        artist.playcount,
        "time"
      )} (ranked #${artist["@attr"].rank})`
      );

    await message.channel.send(embed);
  }

  private async handleAlreadyJumbled(message: Message, jumble: JumbledArtist) {
    jumble.jumbled = this.jumble(jumble.unjumbled);

    this.sessionSetJSON(message, jumbleRedisKey, jumble)

    let embed = new MessageEmbed()
      .setAuthor(
        `Rejumble for ${message.member?.nickname}`,
        message.author.avatarURL() ?? ""
      )
      .setDescription(`I've reshuffled the letters, now who is this artist?
      
      ${jumble.jumbled.code()}`);

    await message.channel.send(embed)
  }

  private jumble(artistName: string): string {
    let jumbled = shuffle(
      artistName.split(/ /).map((t) => shuffle(t.split("")).join(""))
    )
      .join(" ")
      .toLowerCase();

    if (jumbled === artistName.toLowerCase()) {
      return this.jumble(artistName);
    }

    return jumbled;
  }
}

// Can You Solve This Artist Name Jumble?
// Who is this artist?

// IAXLEGA 500

// Hints:
// This artist has 403.5k listeners on last.fm and douzed has scrobbled them 5 times overall (#312 on their top artists list for that period).This artist is tagged as "shoegaze" as well as "dream pop". Last.fm considers Mojave 3 and Slowdive to be similar.

// Command executed by douzed#4353•Today at 10:16 PM