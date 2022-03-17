import { Responder } from "../../services/Responder";
import { Service, ServiceRegistry } from "../../services/ServicesRegistry";
import { MockAnalyticsCollector } from "./MockAnalyticsCollector";
import { MockArgumentParsingService } from "./MockArgumentsParsingService";
import { MockDiscordService } from "./MockDiscordService";
import { MockGowonService } from "./MockGowonService";
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
  MockMirrorballService,
  MockMirrorballUsersService,
  MockNowPlayingEmbedParsingService,
  MockSettingsService,
  MockTrackingService,
  MockUsersService,
  // Since the following services just interact with other services,
  // we only need to mock their dependencies
  Responder,
];

export function setMockServices() {
  ServiceRegistry.setServices(mockServices);
}
