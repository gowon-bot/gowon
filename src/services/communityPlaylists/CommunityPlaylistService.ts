import { User } from "../../database/entity/User";
import { CommunityPlaylist } from "../../database/entity/playlists/CommunityPlaylist";
import { GowonContext } from "../../lib/context/Context";
import { BaseService } from "../BaseService";

export type Submitter = { user: User } | { name: string };
export interface ListeningPartyDetails {
  time?: Date;
  channelID?: string;
}

export class CommunityPlaylistService extends BaseService {
  public async createPlaylist(
    ctx: GowonContext,
    title: string,
    description: string,
    listeningPartyDetails: ListeningPartyDetails
  ): Promise<CommunityPlaylist> {
    const playlist = CommunityPlaylist.create({
      guildID: ctx.requiredGuild.id,
      title,
      description,
      listeningChannelID: listeningPartyDetails.channelID,
      listeningTime: listeningPartyDetails.time,
    });

    return await playlist.save();
  }
}
