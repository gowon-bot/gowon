import { CommandInteraction, Interaction, MessageEmbed } from "discord.js";
import { generateCanCheckMessage } from "../../../helpers/permissions";
import { DiscordService } from "../../../services/Discord/DiscordService";
import { ServiceRegistry } from "../../../services/ServicesRegistry";
import { GowonClient } from "../../GowonClient";
import { HeaderlessLogger, Logger } from "../../Logger";
import { GowonContext } from "../../context/Context";
import { Payload } from "../../context/Payload";
import {
  CanCheck,
  PermissionsService,
} from "../../permissions/PermissionsService";
import { errorEmbed } from "../../views/embeds";
import { Command } from "../Command";
import { CommandRegistry } from "../CommandRegistry";
import { ExtractedCommand } from "../extractor/ExtractedCommand";
import { InteractionRegistry } from "./InteractionRegistry";

export class InteractionHandler {
  client!: GowonClient;
  private commandRegistry = CommandRegistry.getInstance();
  private interactionRegistry!: InteractionRegistry;

  private logger = new HeaderlessLogger();

  permissionsService = ServiceRegistry.get(PermissionsService);
  discordService = ServiceRegistry.get(DiscordService);

  setClient(client: GowonClient) {
    this.client = client;
  }

  async init() {
    this.interactionRegistry = new InteractionRegistry(this.commandRegistry);

    await this.interactionRegistry.init();
  }

  async handle(interaction: Interaction) {
    if (interaction.isCommand()) {
      const extract = this.interactionRegistry.find({
        byName: interaction.commandName,
        withSubcommand: interaction.options.getSubcommand(false) ?? undefined,
      });

      if (extract) {
        const canCheck = await this.permissionsService.canRunInContext(
          this.context(interaction),
          extract.command
        );

        if (!canCheck.allowed) {
          this.handleFailedCanCheck(
            this.context(interaction),
            canCheck,
            extract.command
          );
          return;
        }

        const newCommand = extract.command.copy();

        const ctx = new GowonContext({
          extract,
          payload: new Payload(interaction),
          gowonClient: this.client,
        });

        try {
          await newCommand.execute.bind(newCommand)(ctx);
        } catch {}
      }
    }
  }

  private context(interaction: CommandInteraction) {
    return new GowonContext({
      gowonClient: this.client,
      payload: new Payload(interaction),
      extract: new ExtractedCommand([]),
      command: {
        logger: this.logger,
        guild: interaction.guild!,
        author: interaction.user,
      } as any,
    });
  }

  private async handleFailedCanCheck(
    ctx: GowonContext,
    canCheck: CanCheck,
    command: Command
  ): Promise<void> {
    const message = generateCanCheckMessage(canCheck);

    Logger.log(
      "InteractionHandler",
      `Attempt to run disabled command ${command.name}`
    );

    const embed = errorEmbed(
      new MessageEmbed(),
      ctx.author,
      ctx.requiredAuthorMember,
      message
    );

    await this.discordService.send(ctx, embed, {
      reply: true,
      ephemeral: true,
    });
  }
}
