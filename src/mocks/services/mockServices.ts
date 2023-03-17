import { Service, ServiceRegistry } from "../../services/ServicesRegistry";
import { MockSpotifyService } from "./BaseSpotifyService";
import { MockAnalyticsCollector } from "./MockAnalyticsCollector";
import { MockArgumentParsingService } from "./MockArgumentsParsingService";
import { MockDiscordService } from "./MockDiscordService";
import { MockGowonService } from "./MockGowonService";
import { MockLastFMArguments } from "./MockLastFMArguments";
import { MockLastFMService } from "./MockLastFMService";
import { MockLilacUsersService } from "./MockLilacUsersService";
import { MockMentionsService } from "./MockMentionsService";
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
  MockMentionsService,
  MockMirrorballService,
  MockMirrorballUsersService,
  MockNicknameService,
  MockNowPlayingEmbedParsingService,
  MockPermissionsService,
  MockSettingsService,
  MockSpotifyService,
  MockTrackingService,
  MockUsersService,
];

export function setMockServices() {
  ServiceRegistry.setServices(mockServices);
}

export function replaceMockService(name: string, replacementService: Service) {
  ServiceRegistry.services = ServiceRegistry.services.map((s) => {
    if (s.constructor.name === name || s.mocks === name) {
      return new replacementService();
    } else return s;
  });
}
