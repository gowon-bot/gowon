// import { MessageEmbed } from "discord.js";
// import { Arguments } from "../../../lib/arguments/arguments";
// import { Validation } from "../../../lib/validation/ValidationChecker";
// import { validators } from "../../../lib/validation/validators";
// import { RedirectsChildCommand } from "./RedirectsChildCommand";

// export class Remove extends RedirectsChildCommand {
//   description = "Remove a redirect";
//   usage = ["redirectFrom"];

//   arguments: Arguments = {
//     inputs: {
//       from: { index: { start: 0 } },
//     },
//   };

//   validation: Validation = {
//     from: { validator: new validators.Required({}), friendlyName: "redirect" },
//   };

//   async run() {
//     let from = this.parsedArguments.from as string;

//     let fromCorrected = await this.lastFMService.correctArtist({
//       artist: from,
//     });

//     let redirect = await this.redirectsService.removeRedirect(fromCorrected);

//     let embed = new MessageEmbed()
//       .setTitle(`Removed redirect`)
//       .setDescription(
//         `${redirect.from.bold()} no longer redirects to ${redirect.to.bold()}`
//       );

//     await this.send(embed);
//   }
// }
