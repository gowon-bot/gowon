import { GowonContext } from "../lib/context/Context";
import { ServiceRegistry } from "../services/ServicesRegistry";
import { TagBlacklistService } from "../services/TagBlacklistService";
import blacklistedTags from "../wordBlacklist.json";

export default async function saveFileBannedTagsToDatabase(ctx: GowonContext) {
  const tagBlacklistService = ServiceRegistry.get(TagBlacklistService);
  const letters = "abcdefghijklmnopqrstuvwxyz";

  const { base, tags } = blacklistedTags;

  for (const word of base.strings) {
    try {
      await tagBlacklistService.banTag(ctx, word);
    } catch {}
  }

  for (const word of base.explicit) {
    try {
      await tagBlacklistService.banTag(
        ctx,
        word.map((n) => letters[n - 1]).join("")
      );
    } catch {}
  }

  for (const word of base.regexes) {
    try {
      await tagBlacklistService.banTag(ctx, word, undefined, true);
    } catch {}
  }

  for (const tag of tags.strings) {
    try {
      await tagBlacklistService.banTag(ctx, tag);
    } catch {}
  }

  for (const tag of base.regexes) {
    try {
      await tagBlacklistService.banTag(ctx, tag, undefined, true);
    } catch {}
  }
}
