import { Friend } from "../database/entity/Friend";
import { User } from "../database/entity/User";

// This is super cursed but it *should* only have to be run once so ¯\_(ツ)_/¯
export default async function () {
  const users = await User.find();

  for (const user of users) {
    console.log("Processing user: ", user.id);

    const friends = await Friend.find({ user });

    const friendsSorted = friends.reduce((acc, friend) => {
      const existing = acc.find(
        ([username]) => username === friend.friendUsername
      );

      if (existing) {
        existing[1] = existing[1] + 1;
      } else {
        acc.push([friend.friendUsername, 1, friend.id]);
      }

      return acc;
    }, [] as [string, number, number][]);

    const friendIDs = friendsSorted
      .sort(([_, a], [__, b]) => {
        return b - a;
      })
      .slice(0, 10)
      .map(([_, __, friendID]) => friendID);

    friends.filter((f) => !friendIDs.includes(f.id)).forEach((f) => f.remove());
  }
}
