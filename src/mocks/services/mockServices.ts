import { Responder } from "../../services/Responder";
import { Service, ServiceRegistry } from "../../services/ServicesRegistry";
import { MockSpotifyService } from "./BaseSpotifyService";
import { MockAnalyticsCollector } from "./MockAnalyticsCollector";
import { MockArgumentParsingService } from "./MockArgumentsParsingService";
import { MockDiscordService } from "./MockDiscordService";
import { MockGowonService } from "./MockGowonService";
import { MockLastFMArguments } from "./MockLastFMArguments";
import { MockLastFMService } from "./MockLastFMService";
import { MockMirrorballService } from "./MockMirrorballService";
import { MockMirrorballUsersService } from "./MockMirrorballUsersService";
import { MockNowPlayingEmbedParsingService } from "./MockNowPlayingEmbedParsingService";
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
  MockMirrorballService,
  MockMirrorballUsersService,
  MockNowPlayingEmbedParsingService,
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
