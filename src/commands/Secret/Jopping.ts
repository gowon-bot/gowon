import { BaseCommand } from "../../lib/command/BaseCommand";
import { Emoji } from "../../lib/Emoji";

export default class Jopping extends BaseCommand {
  idSeed = "blackpink jisoo";

  aliases = ["markleeoppa"];
  description = Emoji.joppinh;
  secretCommand = true;

  async run() {
    await this.send(
      `Oh :scream_cat:, you :point_left::triumph: think :thinking::thought_balloon: ya :scream_cat: big :scream:, boy :boy:, throwing :woman_playing_water_polo: three :poultry_leg: stacks :moneybag::sweat_drops:? (Bet :thumbsup:) I'ma :kissing_cat: show :eyes: you :point_left: how to ball :basketball:, you :point_right::arrow_down::point_down_tone5: a mismatch (What?) Opinionated, but :peach: I'm :ok_hand: always :clock5: spitting :cloud::sweat_drops::thought_balloon: straight :couple_with_heart: facts :closed_book: (True :100:) Throw :open_hands::anger: it back :arrow_left:, I :eye: might :mag: throw :open_hands: this on :on: an eight-track (Oh :scream_cat:)`
    );
  }
}
