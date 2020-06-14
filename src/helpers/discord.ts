export function sanitizeForDiscord(string: string): string {
  return string.replace(/\_\*\`\\/g, (match) => `\\${match}`);
}

export function generateLink(text: string, link: string): string {
  return `[${text}](${link})`;
}