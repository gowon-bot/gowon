import { ModalSubmitInteraction } from "discord.js";
import { InteractionReply } from "../../lib/command/interactions/InteractionReply";
import { InteractionID } from "../../lib/command/interactions/interactions";

export default class SubmitModal extends InteractionReply {
  idSeed = "newjeans hanni";
  replyTo = InteractionID.PlaylistSubmit;

  async run() {
    const interaction = this.payload.source as ModalSubmitInteraction;

    await this.send(
      this.newEmbed().setDescription(
        `Successfully selected: \`\`\`${JSON.stringify(
          [...interaction.fields.fields],
          null,
          2
        )}\`\`\``
      )
    );
  }
}
