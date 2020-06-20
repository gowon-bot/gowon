// import FriendsParentCommand, { FriendsChildCommand } from "./Friends";
// import { Message, User } from "discord.js";
// import { Arguments } from "../../lib/arguments/arguments";

// export class AddFriend extends FriendsChildCommand {
//   parent = FriendsParentCommand;
//   aliases = ["af", "add"];
//   description = "Adds a friend";
//   arguments: Arguments = {
//     mentions: {
//       0: { name: "friend", description: "The user to add as your friend" },
//     },
//     inputs: {
//       friendUsername: { index: 0 },
//     },
//   };

//   async run(message: Message) {
//     let username = this.parsedArguments.friendUsername as string,
//       friendUser = this.parsedArguments.friend as User;

//     let friendUsername: string;

//     if (friendUser)
//       friendUsername = await this.usersService.getUsername(friendUser.id);
//     else friendUsername = username;

//     let friend = await this.friendsService.addFriend(
//       message.author.id,
//       friendUsername
//     );

//     await message.channel.send(
//       `Successfully added \`${friend.friendUsername}\` as a friend!`
//     );
//   }
// }
