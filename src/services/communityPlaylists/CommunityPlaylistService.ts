import { User } from "../../database/entity/User";
import { CommunityPlaylist } from "../../database/entity/playlists/CommunityPlaylist";
import { CommunityPlaylistSubmission } from "../../database/entity/playlists/CommunityPlaylistSubmission";
import { UserAlreadySubmittedError } from "../../errors/communityPlaylists";
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
    this.log(
      ctx,
      `Creating a community playlist called "${title}" in ${ctx.requiredGuild.id}`
    );

    const playlist = CommunityPlaylist.create({
      guildID: ctx.requiredGuild.id,
      title,
      description,
      listeningChannelID: listeningPartyDetails.channelID,
      listeningTime: listeningPartyDetails.time,
    });

    return await playlist.save();
  }

  public async submit(
    ctx: GowonContext,
    playlist: CommunityPlaylist,
    submission: CommunityPlaylistSubmission
  ): Promise<CommunityPlaylistSubmission> {
    this.log(
      ctx,
      `Submitting ${submission.spotifyURL} for ${
        submission.submitterName || submission.submitterUser?.discordID
      }`
    );

    const existingSubmission = await this.getSubmission(
      playlist,
      submission.submitterUser!
    );

    if (existingSubmission) {
      throw new UserAlreadySubmittedError();
    } else {
      return await submission.save();
    }
  }

  private async getSubmission(
    playlist: CommunityPlaylist,
    submitter: User
  ): Promise<CommunityPlaylistSubmission | undefined> {
    const submission = await CommunityPlaylistSubmission.findOneBy({
      playlist: { id: playlist.id },
      submitterUser: { id: submitter.id },
    });

    return submission ?? undefined;
  }
}
