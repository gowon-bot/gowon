import { shuffle } from "../../helpers";
import { BaseCommand } from "../../lib/command/BaseCommand";

export default class Maik extends BaseCommand {
  idSeed = "billlie tsuki";

  subcategory = "fun";
  description = `"John can you add a maik command to gowon"\n"ok"`;
  secretCommand = true;

  async run() {
    await this.send(shuffle(quotes)[0]);
  }
}

const quotes: string[] = [
  "To the joker, jopping is just regular hopping",
  "listen up You guys who's mentally sick & ill. I'm not Gorgeous, pretty, king ,god .... Princess..💕 🎀 💝",
  "Good that freak doesnt deserve a penny",
  "Ayo. Is Mr worldwide. listen up You guys who's mentally sick & ill. I'm not gay. But be careful with those words. Respect LGBT people and just live your worst life well. I'm praying for you everyday. Cuz your life is so poor n so broke that you don't even know the words of happy and joyful^^. Dale\n*beat drops*",
  "Maybe... i am a white boy",
  "https://media.discordapp.net/attachments/769118965560770581/877664595446202418/E9Ffy5AXoAooXZw.png",
  "I got a pic of my cat next to the penis vinyl somewhere",
  "Wanna know my credit card number",
  "You havent lived if you have never pondered the anaconda lyrics on a starry night by sea",
  "I had a dream i was watching the new dr strange movie and it just ended with a google screenshot of someone search for jiheon fromis 9"
];
