import { BaseCommand } from "../../lib/command/BaseCommand";

export default class Regular extends BaseCommand {
  idSeed = "2ne1 park bom";
  
  description = "Regular, huh?";
  secretCommand = true;

  async run() {
    await this.send(
      `​I:girl_tone1: be :flashlight: walking :woman_walking_tone1:with :tools: the cheese :cheese: that’s :flushed: the :confetti_ball: Queso :ok_hand_tone1: diamonds :gem:dripping :droplet: better :relieved: bring :handshake: your :woozy_face: raincoat :coat:`
    );
  }
}
