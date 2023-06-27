import "../../shims";

import { mockContextForCommand } from "../../../mocks/MockContext";
import { setMockServices } from "../../../mocks/services/mockServices";
import Roll from "../../../commands/Miscellaneous/Roll";

describe("Roll command", () => {
  beforeEach(setMockServices);

  test("should roll a number", async () => {
    const { command: roll, ctx } = mockContextForCommand(Roll, {
      mock: { arguments: { min: 1, max: 1 } },
    });

    await roll.execute(ctx);

    const response = ctx.latestResponse<string>();

    expect(response).toBe("You rolled a **1**");
  });
});
