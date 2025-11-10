/**
 * Help Formatter
 * Formats help text for CLI commands
 */

export function formatHelp(
  packageJson: any,
  supportedTypes: string[],
  examples: any,
): string {
  return `
${packageJson.name} v${packageJson.version}

Usage:
  claude-multi-database-mcp [options]

Options:
  --help, -h        Show this help message
  --version, -v     Show version information
  --configure       Show configuration instructions
  --find-config     Show config file location

Supported Databases:
${supportedTypes.map((type: string) => `  - ${type}`).join('\n')}

Examples:
${Object.entries(examples)
  .map(
    ([type, urls]: [string, any]) =>
      `\n${type.toUpperCase()}:\n${urls.map((url: string) => `  ${url}`).join('\n')}`,
  )
  .join('\n')}
`;
}
