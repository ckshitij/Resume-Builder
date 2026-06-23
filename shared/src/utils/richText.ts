export type RichSegment = { type: 'plain' | 'italic' | 'bold'; text: string };

/** Parse *italic* and **bold** markers (non-nested). */
export function parseRichText(input: string): RichSegment[] {
  if (!input) return [];

  const segments: RichSegment[] = [];
  const regex = /(\*\*.+?\*\*|\*(?!\*).+?\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(input)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: 'plain', text: input.slice(lastIndex, match.index) });
    }
    const token = match[0];
    if (token.startsWith('**')) {
      segments.push({ type: 'bold', text: token.slice(2, -2) });
    } else {
      segments.push({ type: 'italic', text: token.slice(1, -1) });
    }
    lastIndex = match.index + token.length;
  }

  if (lastIndex < input.length) {
    segments.push({ type: 'plain', text: input.slice(lastIndex) });
  }

  return segments.length ? segments : [{ type: 'plain', text: input }];
}

export function stripRichMarkup(input: string): string {
  return input
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1');
}
