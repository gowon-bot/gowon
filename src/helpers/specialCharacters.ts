export const bullet = "•";
export const emDash = "—";
export const extraWideSpace = " ";
export const openQuote = "“";
export const closeQuote = "”";
export const fourPerEmSpace = " ";

export function quote(string: string): string {
  return openQuote + string + closeQuote;
}
