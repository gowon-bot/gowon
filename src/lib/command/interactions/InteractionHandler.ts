import { Interaction } from "discord.js";
import { Payload } from "../../context/Payload";
import { GowonClient } from "../../GowonClient";
import { CommandRegistry } from "../CommandRegistry";
import { InteractionRegistry } from "./InteractionRegistry";

export class InteractionHandler {
  client!: GowonClient;
  private commandRegistry = CommandRegistry.getInstance();
  private interactionRegistry!: InteractionRegistry;

  constructor() {}

  setClient(client: GowonClient) {
    this.client = client;
  }

  async init() {
    await this.commandRegistry.init();
    this.interactionRegistry = new InteractionRegistry(this.commandRegistry);

    await this.interactionRegistry.init();
  }

  async handle(interaction: Interaction) {
    if (interaction.isCommand()) {
      const { command, runAs } = this.interactionRegistry.find({
        byName: interaction.commandName,
        withSubcommand: interaction.options.getSubcommand(false) ?? undefined,
      });

      if (command && runAs) {
        const newCommand = command.copy();

        try {
          await newCommand.execute.bind(newCommand)(
            new Payload(interaction),
            runAs,
            this.client
          );
        } catch {}
      }
    }
  }
}
