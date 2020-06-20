// import { ParentCommand, ChildCommand } from "../../lib/command/ParentCommand";
// import { FriendsService } from "../../services/dbservices/FriendsService";
// import { AddFriend } from "./AddFriend";
// import { ListFriends } from "./ListFriends";

// export default class FriendsParentCommand extends ParentCommand {
//   children = [new AddFriend(), new ListFriends()];
//   prefix = "friends";
//   default = this.children[1];
// }

// export abstract class FriendsChildCommand extends ChildCommand {
//   friendsService = new FriendsService();
// }
