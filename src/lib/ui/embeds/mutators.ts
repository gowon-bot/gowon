import { LineConsolidator } from "../../LineConsolidator";
import { EmbedMutator, EmbedViewProperties } from "../views/EmbedView";

const reverse = (s?: string) =>
  (s || "")
    .split("")
    .reverse()
    .join("")
    .replaceAll("(", ")")
    .replaceAll(")", "(");
const reverseLinks = (s?: string) =>
  (s || "").replace(/(?<=\[)[^\]]*(?=\])/g, (match) => reverse(match));

export const reverseNowPlayingEmbed: EmbedMutator = (
  properties: EmbedViewProperties
) => {
  const description =
    properties.description instanceof LineConsolidator
      ? properties.description.consolidate()
      : properties.description;

  return {
    title: reverse(properties.title),
    description: reverseLinks(description),
    footer: reverse(properties.footer),
  };
};

export const fmz: EmbedMutator = (properties: EmbedViewProperties) => {
  return {
    footer: properties.footer?.replaceAll(/s/gi, (match) =>
      match === "S" ? "Z" : "z"
    ),
  };
};
