import { Responder } from "../../services/Responder";
import { Service, ServiceRegistry } from "../../services/ServicesRegistry";
import { MockSpotifyService } from "./BaseSpotifyService";
import { MockAnalyticsCollector } from "./MockAnalyticsCollector";
import { MockArgumentParsingService } from "./MockArgumentsParsingService";
import { MockDiscordService } from "./MockDiscordService";
import { MockGowonService } from "./MockGowonService";
import { MockLastFMArguments } from "./MockLastFMArguments";
import { MockLastFMService } from "./MockLastFMService";
import { MockLilacUsersService } from "./MockLilacUsersService";
import { MockMetaService } from "./MockMetaService";
import { MockMirrorballService } from "./MockMirrorballService";
import { MockMirrorballUsersService } from "./MockMirrorballUsersService";
import { MockNicknameService } from "./MockNicknameService";
import { MockNowPlayingEmbedParsingService } from "./MockNowPlayingEmbedParsingService";
import { MockPermissionsService } from "./MockPermissionsService";
import { MockSettingsService } from "./MockSettingsService";
import { MockTrackingService } from "./MockTrackingService";
import { MockUsersService } from "./MockUsersService";

export const mockServices: Service[] = [
  MockAnalyticsCollector,
  MockArgumentParsingService,
  MockDiscordService,
  MockGowonService,
  MockLastFMArguments,
  MockLastFMService,
  MockLilacUsersService,
  MockMetaService,
  MockMirrorballService,
  MockMirrorballUsersService,
  MockNicknameService,
  MockNowPlayingEmbedParsingService,
  MockPermissionsService,
  MockSettingsService,
  MockSpotifyService,
  MockTrackingService,
  MockUsersService,
  // Since the following services just interact with other services,
  // we only need to mock their dependencies
  Responder,
];

export function setMockServices() {
  ServiceRegistry.setServices(mockServices);
}

export function replaceMockService(name: string, replacementService: Service) {
  ServiceRegistry.setServices(
    mockServices.map((s) => (s.name === name ? replacementService : s))
  );
}
