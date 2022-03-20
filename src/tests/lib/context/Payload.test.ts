import { Payload } from "../../../lib/context/Payload";
import { MockCommandInteraction, MockMessage } from "../../../mocks/discord";
import { MockTweet } from "../../../mocks/twitter";

describe("Payload", () => {
  test("should be created with a source", () => {
    const mockPayload = new Payload(new MockMessage());

    expect(mockPayload.source.id).toBeTruthy();
  });

  test("should be of the correct source", () => {
    const mockMessagePayload = new Payload(new MockMessage());
    const mockInteractionPayload = new Payload(new MockCommandInteraction());
    const mockTweetPayload = new Payload(new MockTweet());

    expect(mockMessagePayload.isMessage()).toBeTruthy();
    expect(mockInteractionPayload.isInteraction()).toBeTruthy();
    expect(mockTweetPayload.isTweet()).toBeTruthy();

    expect(
      mockMessagePayload.isDiscord() && mockInteractionPayload.isDiscord()
    ).toBeTruthy();
  });
});
