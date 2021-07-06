import { sleep } from "../../helpers";
import { BaseCommand } from "../../lib/command/BaseCommand";
import { Emoji } from "../../lib/Emoji";

export default class FuckOff extends BaseCommand {
  idSeed = "hot issue nahyun";

  subcategory = "fun";
  description = ":)";
  secretCommand = true;

  async run() {
    const itsuko = this.gowonClient.specialUsers.alphaTesters.find(
      (t) => t.name.toLowerCase() === "itsuko"
    );

    // if (itsuko && this.author.id === itsuko?.id) {
    if (itsuko && this.author.id === "267794154459889664") {
      await this.reply(
        `What the fuck did you just fucking say about me, you little bitch? I'll have you know I graduated top of my class in the Last.fm academy, and I've been involved in numerous secret raids on last.fm charts, and I have over 300 confirmed scrobbles. I am trained in botting and I'm the top open scrobbler in the entire last.fm Discord server. You are nothing to me but just another target. I will wipe you the fuck out with precision the likes of which has never been seen before on this Earth, mark my fucking words. You think you can get away with saying that shit to me over the Internet? Think again, fucker. As we speak I am contacting my secret network of scrobblers across the world and your IP is being traced right now so you better prepare for the storm, maggot. The storm that wipes out the pathetic little thing you call your life. You're fucking dead, kid. I can be anywhere, anytime, and I can outscrobble you in over seven hundred ways, and that's just with my bare hands. Not only am I extensively trained in unbotted scrobbling, but I have access to the entire arsenal of ARMY and I will use it to its full extent to wipe your miserable ass off the face of the website, you little shit. If only you could have known what unholy retribution your little "clever" comment was about to bring down upon you, maybe you would have held your fucking tongue. But you couldn't, you didn't, and now you're paying the price, you goddamn idiot. I will shit scrobbles all over you and you will drown in it. You're fucking dead, kiddo.`
      );
    } else {
      await sleep(200);
      await this.message.react(Emoji.fuckyou);
    }
  }
}
