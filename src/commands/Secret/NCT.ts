import { Command } from "../../lib/command/Command";

export default class NCT extends Command {
  idSeed = "iz*one hitomi";

  subcategory = "fun";
  description = "thot";
  secretCommand = true;

  async run() {
    await this.reply(
      "HEY:speaking_head:YO:zany_face: LISTEN:ear_tone1: UP :white_check_mark:NO :x:MATTER:yawning_face: WHAT:pineapple: THEY:game_die: SAY:thumbsdown: NO :no_entry_sign:MATTER:monkey_face: WHAT:spoon: THEY:sponge: DO:vulcan_tone1: WE :levitate_tone1:GO:raised_hands_tone1: RESONATE:sparkles: RESONATE:sunglasses:"
    );
  }
}
