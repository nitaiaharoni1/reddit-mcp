/**
 * Help Formatter
 * Formats help text for CLI commands
 */

export function formatHelp(packageJson: any): string {
  return `
${packageJson.name} v${packageJson.version}

Usage:
  reddit-mcp [options]

Options:
  --help, -h        Show this help message
  --version, -v     Show version information

Environment Variables:
  REDDIT_CLIENT_ID        Your Reddit app Client ID (required)
  REDDIT_CLIENT_SECRET    Your Reddit app Client Secret (required)
  REDDIT_USER_AGENT       User-Agent string (required)
  REDDIT_USERNAME         Your Reddit username (optional)
  REDDIT_PASSWORD         Your Reddit password (optional)

For more information, visit: https://github.com/nitaiaharoni1/reddit-mcp
`;
}
