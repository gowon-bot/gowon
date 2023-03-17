import "../../shims";

import { mockContext } from "../../../mocks/MockContext";
import { MockUser } from "../../../mocks/discord";
import { mockEntities } from "../../../mocks/gowon";
import { MockMentionsService } from "../../../mocks/services/MockMentionsService";
import {
  MockUsersService,
  mockUsersServiceWithUsers,
} from "../../../mocks/services/MockUsersService";
import {
  replaceMockService,
  setMockServices,
} from "../../../mocks/services/mockServices";
import { ServiceRegistry } from "../../../services/ServicesRegistry";
import { MentionsService } from "../../../services/arguments/mentions/MentionsService";

const miso = mockEntities.user({
  id: 69,
  discordID: "500385855072894982",
  lastFMUsername: "miso-bot",
});

describe("MentionsService", () => {
  beforeEach(() => {
    setMockServices();
    replaceMockService(MockMentionsService.name, MentionsService);
    replaceMockService(
      MockUsersService.name,
      mockUsersServiceWithUsers([mockEntities.user(), miso])
    );
  });

  test("should return mentions when provided with a Discord ID", async () => {
    const mentionsService = ServiceRegistry.get(MentionsService);

    const ctx = mockContext({
      mock: { arguments: { userID: miso.discordID } },
    });

    const mentions = await mentionsService.getMentions(ctx, {});

    expect(mentions.mentionedDBUser?.id).toBe(miso.id);
    expect(mentions.mentionedUsername).toBe(miso.lastFMUsername);
  });

  test("should return mentions when provided an lfm mention", async () => {
    const mentionsService = ServiceRegistry.get(MentionsService);

    const ctx = mockContext({
      mock: {
        arguments: { lastfmUsername: miso.lastFMUsername },
      },
    });

    const mentions = await mentionsService.getMentions(ctx, {});

    expect(mentions.mentionedDBUser?.id).toBe(miso.id);
    expect(mentions.mentionedUsername).toBe(miso.lastFMUsername);
  });

  test("should return mentions when provided a Discord mention", async () => {
    const mentionsService = ServiceRegistry.get(MentionsService);

    const ctx = mockContext({
      mock: { arguments: { user: new MockUser(miso.discordID) } },
    });

    const mentions = await mentionsService.getMentions(ctx, {});

    expect(mentions.mentionedDBUser?.id).toBe(miso.id);
    expect(mentions.mentionedUsername).toBe(miso.lastFMUsername);
  });
});
