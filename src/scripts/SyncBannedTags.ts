import { Message } from "discord.js";
import fetch from "node-fetch";
import streamToString from "stream-to-string";
import { LogicError } from "../errors/errors";
import { GowonContext } from "../lib/context/Context";
import { ServiceRegistry } from "../services/ServicesRegistry";
import { WordBlacklistService } from "../services/WordBlacklistService";

export default async function syncBannedTags({
  ctx,
  message,
}: {
  ctx: GowonContext;
  message: Message;
}) {
  const blacklistService = ServiceRegistry.get(WordBlacklistService);
  const wordsFile = message.attachments.first();

  if (!wordsFile)
    throw new LogicError("Please attach a list of words to blacklist!");

  const file = await fetch(wordsFile.url);

  const fileContent = await streamToString(file.body);

  for (const word of fileContent.split("\n")) {
    if (word) {
      try {
        await blacklistService.serverBanTag(ctx, word);
      } catch {}
    }
  }
}
