const urlRegex = /(https?:\/\/[a-zA-Z0-9\-_.]+\.[a-zA-Z0-9\-_.]{1,}[^\s]+)/g;

export class URLParser {
  parse(string: string): string[] {
    const matches = [...(string.matchAll(urlRegex) || [])];

    return matches.map((m) => m[0]);
  }

  static removeURLsFromString(string: string): string {
    return string.replaceAll(urlRegex, "");
  }
}
