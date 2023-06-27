import { GowonContext } from "../../context/Context";
import { Runnable, RunnableType } from "../Runnable";
import { InteractionID } from "./interactions";

export type InteractionReplyClass = { new (): InteractionReply };

export abstract class InteractionReply extends Runnable {
  static type = RunnableType.InteractionReply;

  ctx!: GowonContext<(typeof this)["customContext"], InteractionReply>;

  abstract replyTo: InteractionID;

  async execute(ctx: GowonContext): Promise<void> {
    await super.execute(ctx);

    await this.deferResponseIfInteraction();

    await this.run();
  }
}
