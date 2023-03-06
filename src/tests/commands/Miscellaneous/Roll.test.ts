import "../../shims";

import Roll from "../../../commands/Miscellaneous/Roll";
import { mockContextForCommand } from "../../../mocks/MockContext";
import { setMockServices } from "../../../mocks/services/mockServices";

describe("Roll command", () => {
  beforeAll(setMockServices);

  test("should roll a number", async () => {
    const { command: roll, ctx } = mockContextForCommand(Roll, {
      mock: { arguments: { min: 1, max: 1 } },
    });

    await roll.execute(ctx);

    const response = ctx.latestResponse<string>();

    expect(response).toBe("You rolled a **1**");
  });
});
