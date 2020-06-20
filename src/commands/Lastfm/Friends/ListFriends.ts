// import FriendsParentCommand, { FriendsChildCommand } from "./Friends";
// import { Message, MessageEmbed } from "discord.js";

// export class ListFriends extends FriendsChildCommand {
//   parent = FriendsParentCommand;
//   aliases = ["list"]

//   async run(message: Message, runAs: string) {
//     let friends = await this.friendsService.listFriends(message.author.id);

//     let friendsNowPlaying = await this.friendsService.friendsNowPlaying(
//       friends
//     );

//     let embed = new MessageEmbed()
//       .setTitle(`Friends for ${message.author.username}`)
//       .setDescription(
//         friendsNowPlaying.map(
//           (f) =>
//             `${f.friendUsername} - ${f.nowPlaying.name} by ${f.nowPlaying.artist["#text"]} from _${f.nowPlaying.album["#text"]}_`
//         )
//       );

//     await message.channel.send(embed);
//   }
// }
