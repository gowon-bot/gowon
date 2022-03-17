import { Interaction } from "discord.js";
import { GowonContext } from "../../context/Context";
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

        const ctx = new GowonContext({
          runAs,
          payload: new Payload(interaction),
          gowonClient: this.client,
        });

        try {
          await newCommand.execute.bind(newCommand)(ctx);
        } catch {}
      }
    }
  }
}
