import { DataSource } from "typeorm";
import ormConfig from "../../ormconfig.json";
import { AlternateAlbumCover } from "./entity/AlternateAlbumCover";
import { ArtistCrownBan } from "./entity/ArtistCrownBan";
import { ArtistRedirect } from "./entity/ArtistRedirect";
import { ArtistTagCache } from "./entity/ArtistTagCache";
import { Combo } from "./entity/Combo";
import { Crown } from "./entity/Crown";
import { CrownBan } from "./entity/CrownBan";
import { Friend } from "./entity/Friend";
import { NowPlayingConfig } from "./entity/NowPlayingConfig";
import { Permission } from "./entity/Permission";
import { Setting } from "./entity/Setting";
import { SpotifyPlaylistTag } from "./entity/SpotifyPlaylistTag";
import { TagBan } from "./entity/TagBan";
import { User } from "./entity/User";
import { AlbumCard } from "./entity/cards/AlbumCard";
import { FishyCatch } from "./entity/fishy/FishyCatch";
import { FishyProfile } from "./entity/fishy/FishyProfile";
import { FishyQuest } from "./entity/fishy/FishyQuest";
import { CommandRun } from "./entity/meta/CommandRun";
import { CrownEvent } from "./entity/meta/CrownEvent";
import { Guild } from "./entity/meta/Guild";

export class DB {
  dataSource!: DataSource;

  async connect(connection: string = "default"): Promise<DataSource> {
    const config = ormConfig.find((c) => c.name === connection);

    const dataSource = new DataSource({
      ...config,
      type: "postgres",
      entities: [
        // misc games
        AlbumCard,
        FishyCatch,
        FishyProfile,
        FishyQuest,
        // meta
        CommandRun,
        CrownEvent,
        Error,
        Guild,
        // other
        AlternateAlbumCover,
        ArtistCrownBan,
        ArtistRedirect,
        ArtistTagCache,
        Combo,
        Crown,
        CrownBan,
        Friend,
        NowPlayingConfig,
        Permission,
        Setting,
        SpotifyPlaylistTag,
        TagBan,
        User,
      ],
    });

    this.dataSource = await dataSource.initialize();
    await dataSource.synchronize();

    return dataSource;
  }

  async close() {
    await this.dataSource.destroy();
  }
}
