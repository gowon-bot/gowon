export function uppercaseFirst(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function titlecase(string: string): string {
  return string.split(/\s+/).map(uppercaseFirst).join(" ");
}

/**
 * Compares two strings loosely, ignoring spaces, hypens, and casing
 */
export function looseCompare(str1: string, str2: string): boolean {
  return (
    str1.toLowerCase().replaceAll(/\s+|\-/g, "") ===
    str2.toLowerCase().replaceAll(/\s+|\-/g, "")
  );
}
