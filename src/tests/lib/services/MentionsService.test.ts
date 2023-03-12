import "../../shims";

import { Payload } from "../../../lib/context/Payload";
import { mockContext } from "../../../mocks/MockContext";
import { MockMessage } from "../../../mocks/discord";
import { mockEntities } from "../../../mocks/gowon";
import { MockMentionsService } from "../../../mocks/services/MockMentionsService";
import {
  replaceMockService,
  setMockServices,
} from "../../../mocks/services/mockServices";
import { ServiceRegistry } from "../../../services/ServicesRegistry";
import { MentionsService } from "../../../services/arguments/mentions/MentionsService";

describe("MentionsService", () => {
  beforeEach(() => {
    setMockServices();
    replaceMockService(MockMentionsService.name, MentionsService);
  });

  test("should return a db user when provided an id mention", async () => {
    const mentionsService = ServiceRegistry.get(MentionsService);

    const ctx = mockContext({
      payload: new Payload(
        new MockMessage(`id: ${mockEntities.user().discordID}`)
      ),
    });

    const mentions = await mentionsService.getMentions(ctx, {});

    expect(mentions.dbUser.id).toBe(mockEntities.user().id);
  });
});
