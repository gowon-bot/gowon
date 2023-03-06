import "../../shims";

import { SilentLogger } from "../../../lib/Logger";
import { CommandHandler } from "../../../lib/command/CommandHandler";
import { Payload } from "../../../lib/context/Payload";
import { mockContext } from "../../../mocks/MockContext";
import {
  CommandThatShouldntRun,
  DummyCommand,
} from "../../../mocks/command/commands";
import { mockRegistry } from "../../../mocks/command/registry";
import { MockMessage } from "../../../mocks/discord";
import { mockEntities } from "../../../mocks/gowon";
import {
  MockDiscordService,
  erroringMockDiscordService,
} from "../../../mocks/services/MockDiscordService";
import {
  replaceMockService,
  setMockServices,
} from "../../../mocks/services/mockServices";

describe("CommandHandler", () => {
  beforeAll(setMockServices);

  const createCommandHandler = () => {
    const commandHandler = new CommandHandler();
    commandHandler.setClient(mockEntities.gowonClient);
    commandHandler.context = (message) =>
      mockContext({
        payload: new Payload(message),
        logger: new SilentLogger(),
      });

    // Override the logger with a silent one
    (commandHandler as any).logger = new SilentLogger();

    return commandHandler;
  };

  test("should instantiate", () => {
    const commandHandler = createCommandHandler();

    expect(commandHandler.client).toBeTruthy();
  });

  test("should ignore a message that doesn't start with the prefix", async () => {
    replaceMockService(MockDiscordService.name, erroringMockDiscordService());

    const commandHandler = createCommandHandler();
    commandHandler.commandRegistry = mockRegistry([CommandThatShouldntRun]);

    const mockMessage = new MockMessage("Oh 눈을 떴을 때");

    await expect(commandHandler.handle(mockMessage)).resolves.toBeFalsy();
    await expect(commandHandler.handle(mockMessage)).resolves.not.toThrow();
  });

  test("should not ignore a message that includes a command", async () => {
    const commandHandler = createCommandHandler();
    commandHandler.commandRegistry = mockRegistry([DummyCommand]);

    const result = await commandHandler.handle(
      new MockMessage(DummyCommand.nameWithPrefix())
    );

    expect(result).toBeTruthy();
  });
});
