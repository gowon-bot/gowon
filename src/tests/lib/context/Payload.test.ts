import "../../shims";

import { Payload } from "../../../lib/context/Payload";
import { MockCommandInteraction, MockMessage } from "../../../mocks/discord";
import { setMockServices } from "../../../mocks/services/mockServices";

describe("Payload", () => {
  beforeEach(setMockServices);

  test("should be created with a source", () => {
    const mockPayload = new Payload(new MockMessage());

    expect(mockPayload.source.id).toBeTruthy();
  });

  test("should be of the correct source", () => {
    const mockMessagePayload = new Payload(new MockMessage());
    const mockInteractionPayload = new Payload(new MockCommandInteraction());

    expect(mockMessagePayload.isMessage()).toBeTruthy();
    expect(mockInteractionPayload.isInteraction()).toBeTruthy();
  });
});
