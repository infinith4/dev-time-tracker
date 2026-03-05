/**
 * Parse "description@project" format.
 * If no @ is present, returns the whole input as description with no project.
 * The -p option takes priority over @ syntax (handled by callers).
 */
export function parseDescriptionProject(input: string): { description: string; project?: string } {
  const atIndex = input.lastIndexOf("@");
  if (atIndex === -1 || atIndex === input.length - 1) {
    return { description: input };
  }
  return {
    description: input.slice(0, atIndex),
    project: input.slice(atIndex + 1),
  };
}
