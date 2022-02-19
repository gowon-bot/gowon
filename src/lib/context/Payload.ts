import { Interaction, Message } from "discord.js";

export type OriginalPayload = Message | Interaction;

export function isMessage(payload: OriginalPayload): payload is Message {
  return payload instanceof Message;
}

// export class Payload<T extends OriginalPayload = OriginalPayload> {
//   constructor(public source: T) {}

//   get guild(): Guild {
//     return this.source.guild!;
//   }

//   get author(): User {
//     if (isMessage(this.source)) return this.source.author;
//     return this.source.user;
//   }

//   get member(): GuildMember {
//     if (isMessage(this.source)) return this.source.member!;
//     else return this.source.member as GuildMember;
//   }

//   get mentions() {
//     if (!isMessage(this.source)) {
//       this.source.
//     }
//   }
// }
