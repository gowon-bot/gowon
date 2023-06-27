import { InteractionReply, InteractionReplyClass } from "./InteractionReply";

export class InteractionReplyRegistry {
  private constructor() {}

  private static instance: InteractionReplyRegistry;

  public static getInstance(): InteractionReplyRegistry {
    if (!this.instance) this.instance = new InteractionReplyRegistry();

    return this.instance;
  }

  private pool: Record<string, InteractionReplyClass> = {};

  public init(interactionReplies: InteractionReplyClass[]) {
    this.pool = {};

    for (const interactionReply of interactionReplies) {
      const instance = new interactionReply();

      if (instance.archived) {
        continue;
      }

      this.pool[instance.replyTo] = interactionReply;
    }
  }

  public get(id: string): InteractionReply | undefined {
    const interactionReply = this.pool[id];

    return new interactionReply();
  }
}
