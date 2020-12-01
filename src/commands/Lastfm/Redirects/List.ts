// import { MessageEmbed } from "discord.js";
// import { LogicError } from "../../../errors";
// import { Arguments } from "../../../lib/arguments/arguments";
// import { Validation } from "../../../lib/validation/ValidationChecker";
// import { validators } from "../../../lib/validation/validators";
// import { RedirectsChildCommand } from "./RedirectsChildCommand";

// export class List extends RedirectsChildCommand {
//   description = "List redirects";
//   usage = ["redirectTo"];

//   arguments: Arguments = {
//     inputs: {
//       to: { index: 0, splitOn: "|" },
//     },
//   };

//   validation: Validation = {
//     to: { validator: new validators.Required({}), friendlyName: "artist" },
//   };

//   async run() {
//     let to = this.parsedArguments.to as string;

//     let toCorrected = await this.lastFMService.correctArtist({ artist: to });

//     let redirects = await this.redirectsService.listRedirects(to);

//     if (!redirects.length)
//       throw new LogicError(`Nothing redirects to ${toCorrected.strong()}!`);

//     let embed = new MessageEmbed()
//       .setTitle(`Artists that redirect to ${toCorrected}`)
//       .setDescription(
//         "```\n" + redirects.map((r) => r.from).join(", ") + "\n```"
//       );

//     await this.send(embed);
//   }
// }
