import { Message } from "discord.js";
import { sum } from "mathjs";
import { User as DBUser } from "../../../database/entity/User";
import { bold, italic, sanitizeForDiscord } from "../../../helpers/discord";
import { LastfmLinks } from "../../../helpers/lastfm/LastfmLinks";
import { RecentTrack } from "../../../services/LastFM/converters/RecentTracks";
import { ServiceRegistry } from "../../../services/ServicesRegistry";
import { AlbumCoverService } from "../../../services/moderation/AlbumCoverService";
import { GowonContext } from "../../context/Context";
import { RenderedComponent } from "../../nowplaying/base/BaseNowPlayingComponent";
import { FMUsernameDisplay } from "../../settings/SettingValues";
import { SettingsService } from "../../settings/SettingsService";
import { TagConsolidator } from "../../tags/TagConsolidator";
import { Image } from "../Image";
import { EmbedView } from "../views/EmbedView";
import { View } from "../views/View";

export class NowPlayingEmbed extends View {
  public static readonly rowSize = 3;

  nowPlaying!: RecentTrack;
  username!: string;
  dbUser!: DBUser;
  usernameDisplay!: string;
  albumCover?: Image;
  components!: RenderedComponent[];
  customReactions!: string[];
  ctx!: GowonContext;

  get albumCoverService(): AlbumCoverService {
    return ServiceRegistry.get(AlbumCoverService);
  }

  get settingsService(): SettingsService {
    return ServiceRegistry.get(SettingsService);
  }

  constructor(private baseEmbed: EmbedView = new EmbedView()) {
    super();

    this.baseEmbed.hook("afterSend", this.reactWithCustom.bind(this));
  }

  asDiscordSendable(): EmbedView {
    const links = LastfmLinks.generateTrackLinksForEmbed(this.nowPlaying);

    return this.baseEmbed
      .setHeader(
        `${
          this.nowPlaying.isNowPlaying ? "Now playing" : "Last scrobbled"
        } for ${this.usernameDisplay}`
      )
      .setHeaderURL(
        this.usernameDisplay === FMUsernameDisplay.DISCORD_USERNAME
          ? undefined
          : LastfmLinks.userPage(this.username)
      )
      .setDescription(
        `by ${bold(links.artist, false)}` +
          (this.nowPlaying.album ? ` from ${italic(links.album, false)}` : "")
      )
      .setTitle(sanitizeForDiscord(this.nowPlaying.name))
      .setURL(
        LastfmLinks.trackPage(this.nowPlaying.artist, this.nowPlaying.name)
      )
      .setThumbnail(this.albumCover || this.albumCoverService.defaultCover)
      .setFooter(this.getFooter());
  }

  setNowPlaying(track: RecentTrack, tagConsolidator?: TagConsolidator): this {
    this.nowPlaying = track;

    this.setReacts(this.getEasterEggs(track, tagConsolidator));

    return this;
  }

  setUsername(username: string): this {
    this.username = username;
    return this;
  }

  setDbUser(dbUser: DBUser): this {
    this.dbUser = dbUser;
    return this;
  }

  setUsernameDisplay(usernameDisplay: string): this {
    this.usernameDisplay = usernameDisplay;
    return this;
  }

  setComponents(components: RenderedComponent[]): this {
    this.components = components;
    return this;
  }

  setCustomReacts(reacts: string[]): this {
    this.customReactions = reacts;
    return this;
  }

  setAlbumCover(cover: Image | undefined): this {
    this.albumCover = cover;
    return this;
  }

  private getFooter(): string {
    const rendered = this.organizeRows(
      this.components.filter((s) => !!s.string && s.size !== undefined)
    );

    return rendered
      .map((row) => row.map((r) => r.string).join(" • "))
      .join("\n");
  }

  private organizeRows(
    renderedComponents: RenderedComponent[]
  ): RenderedComponent[][] {
    const finalArray = [] as RenderedComponent[][];

    for (const renderedComponent of renderedComponents) {
      const findFunction = (row: RenderedComponent[]) =>
        NowPlayingEmbed.rowSize - sum(...row.map((r) => r.size)) >=
        renderedComponent.size;

      const index = finalArray.findIndex(findFunction);

      if (index !== -1) {
        finalArray[index].push(renderedComponent);
      } else {
        finalArray.push([renderedComponent]);
      }
    }

    return finalArray;
  }

  private async reactWithCustom(message: Message): Promise<void> {
    const badReactions: string[] = [];

    for (const reaction of this.customReactions) {
      try {
        await message.react(reaction);
      } catch {
        badReactions.push(reaction);
      }
    }

    if (badReactions.length) {
      await this.settingsService.set(
        this.ctx,
        "reacts",
        { userID: this.baseEmbed.getAuthorUser()!.id },
        JSON.stringify(
          this.customReactions.filter((r) => !badReactions.includes(r))
        )
      );
    }
  }

  protected getEasterEggs(
    track: RecentTrack,
    tagConsolidator?: TagConsolidator
  ): string[] {
    const reacts: string[] = [];

    if (
      track.artist.toLowerCase() === "twice" &&
      track.name.toLowerCase() === "jaljayo good night"
    ) {
      reacts.push("😴");
    }

    if (
      tagConsolidator?.hasTag("rare sad boy", "rsb", "rsg", "rare sad girl")
    ) {
      reacts.push("😭");
    }

    return reacts;
  }
}
