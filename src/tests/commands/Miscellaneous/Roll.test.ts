import Roll from "../../../commands/Miscellaneous/Roll";
import { mockContext } from "../../../mocks/MockContext";
import { setMockServices } from "../../../mocks/services/mockServices";

describe("Roll command", () => {
  beforeAll(setMockServices);

  // This will fail due to extensions - not for long :)
  test("should roll a number", async () => {
    const ping = new Roll();
    const ctx = mockContext({ mock: { parsedArguments: { min: 1, max: 1 } } });

    await ping.execute(ctx);

    const response = ctx.latestResponse<string>();

    expect(response).toBe("You rolled a **1**");
  });
});
