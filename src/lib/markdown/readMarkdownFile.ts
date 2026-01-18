import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Reads a markdown file from the file system at build time.
 *
 * This utility enables Next.js Server Components to read markdown files
 * directly from the file system, making it ideal for static content that
 * needs to be rendered in the app.
 *
 * @param filePath - Path relative to the project root (e.g., 'README.md' or 'docs/README.md')
 * @returns The file contents as a string
 *
 * @example
 * ```ts
 * // In a Server Component
 * const readmeContent = readMarkdownFile('README.md');
 * ```
 */
export function readMarkdownFile(filePath: string): string {
  try {
    // Resolve from project root
    const fullPath = join(process.cwd(), filePath);
    const content = readFileSync(fullPath, 'utf-8');
    return content;
  } catch (error) {
    console.error(`Error reading markdown file ${filePath}:`, error);
    throw new Error(`Failed to read markdown file: ${filePath}`);
  }
}
