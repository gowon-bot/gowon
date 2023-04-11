import { GowonContext } from "../lib/context/Context";
import { ServiceRegistry } from "../services/ServicesRegistry";
import { WordBlacklistService } from "../services/WordBlacklistService";
import blacklistedTags from "../wordBlacklist.json";

export default async function saveFileBannedTagsToDatabase(ctx: GowonContext) {
  const wordBlacklistService = ServiceRegistry.get(WordBlacklistService);
  const letters = "abcdefghijklmnopqrstuvwxyz";

  const { base, tags } = blacklistedTags;

  for (const word of base.strings) {
    try {
      await wordBlacklistService.banTag(ctx, word);
    } catch {}
  }

  for (const word of base.explicit) {
    try {
      await wordBlacklistService.banTag(
        ctx,
        word.map((n) => letters[n - 1]).join("")
      );
    } catch {}
  }

  for (const word of base.regexes) {
    try {
      await wordBlacklistService.banTag(ctx, word, undefined, true);
    } catch {}
  }

  for (const tag of tags.strings) {
    try {
      await wordBlacklistService.banTag(ctx, tag);
    } catch {}
  }

  for (const tag of base.regexes) {
    try {
      await wordBlacklistService.banTag(ctx, tag, undefined, true);
    } catch {}
  }
}
