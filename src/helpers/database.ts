export function sqlLikeEscape(str: string) {
  return str.replaceAll(/\_|\%/g, (match) => `\\${match}`);
}
