import { GowonContext } from "../../context/Context";
import { ArgumentsMap } from "../../context/arguments/types";
import { Runnable, RunnableType } from "../Runnable";
import { InteractionID } from "./interactions";

export type InteractionReplyClass = { new (): InteractionReply };

export abstract class InteractionReply<
  ArgumentsType extends ArgumentsMap = {}
> extends Runnable<ArgumentsType> {
  static type = RunnableType.InteractionReply;

  ctx!: GowonContext<(typeof this)["customContext"], InteractionReply>;

  abstract replyTo: InteractionID;

  async execute(ctx: GowonContext): Promise<void> {
    await super.execute(ctx);

    await this.deferResponseIfInteraction();

    await this.run();
  }
}
