import { InteractionReply, InteractionReplyClass } from "./InteractionReply";
import { InteractionID, matchesInteractionID } from "./interactions";

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
    for (const [interactionID, interactionReply] of Object.entries(this.pool)) {
      if (matchesInteractionID(id, interactionID as InteractionID)) {
        return new interactionReply();
      }
    }

    return undefined;
  }
}
