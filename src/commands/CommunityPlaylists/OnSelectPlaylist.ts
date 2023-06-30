import { CommunityPlaylist } from "../../database/entity/playlists/CommunityPlaylist";
import { InteractionReply } from "../../lib/command/interactions/InteractionReply";
import { InteractionID } from "../../lib/command/interactions/interactions";
import { Emoji } from "../../lib/emoji/Emoji";
import { PlaylistSubmitModal } from "../../lib/views/playlistSubmissions/PlaylistSubmitModal";

export default class OnSelectPlaylist extends InteractionReply {
  idSeed = "newjeans minji";
  replyTo = InteractionID.SelectPlaylist;

  shouldDefer = false;

  async run() {
    const modal = new PlaylistSubmitModal(
      CommunityPlaylist.create({
        id: 10,
        title: "Test playlist",
        description: "I am a playlist!",
        emoji: Emoji.common,
      })
    );

    await this.send(modal);
  }
}
