import { Interaction } from "discord.js";
import { GowonContext } from "../../context/Context";
import { ArgumentsMap } from "../../context/arguments/types";
import { Runnable, RunnableType } from "../Runnable";
import { InteractionID, decomposeInteractionID } from "./interactions";

export type InteractionReplyClass = { new (): InteractionReply };

export abstract class InteractionReply<
  InteractionType extends Interaction = Interaction,
  ArgumentsType extends ArgumentsMap = {}
> extends Runnable<ArgumentsType> {
  static type = RunnableType.InteractionReply;

  ctx!: GowonContext<(typeof this)["customContext"], InteractionReply>;

  abstract replyTo: InteractionID;

  async execute(ctx: GowonContext): Promise<void> {
    await super.execute(ctx);

    await this.deferResponseIfInteraction();

    this.logger.openRunnableHeader(this);
    this.logger.logRunnable(ctx);

    await this.run();

    this.logger.closeRunnableHeader(this);
  }

  public get type(): RunnableType {
    return InteractionReply.type;
  }

  protected getInteraction(): InteractionType {
    return this.payload.source as InteractionType;
  }

  protected getInteractionParameter(): number {
    return decomposeInteractionID((this.getInteraction() as any).customId);
  }
}
