import { MessageCreateOptions, ModalBuilder } from "discord.js";

export abstract class SendableComponent {
  abstract present(): MessageCreateOptions;
}

export abstract class SendableModal {
  abstract present(): ModalBuilder;
}
