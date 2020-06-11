export function sanitizeForDiscord(string: string): string {
    return string.replace(/\_\*\`\\/g, match => `\\${match}`)
}