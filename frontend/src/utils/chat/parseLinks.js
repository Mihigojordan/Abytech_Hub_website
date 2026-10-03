/**
 * parseLinks — splits a message string into an array of plain-text and URL segments.
 *
 * Matches:
 *   - https://...  and  http://...
 *   - www.something.com  (href auto-prefixed with https://)
 *
 * Trailing punctuation that is clearly not part of the URL (. , ) ! ?) is
 * stripped from the matched URL so it stays with the surrounding text.
 *
 * @param {string} text
 * @returns {Array<{ type: 'text'|'url', value: string, href: string }>}
 */
export function parseLinks(text) {
  if (!text) return [];

  // Matches http(s):// URLs and bare www. URLs
  const URL_REGEX =
    /((https?:\/\/|www\.)[^\s<>"']+)/gi;

  const segments = [];
  let lastIndex = 0;
  let match;

  while ((match = URL_REGEX.exec(text)) !== null) {
    const rawUrl = match[0];
    const start  = match.index;

    // Strip trailing punctuation that is almost never part of a URL
    const stripped = rawUrl.replace(/[.,!?)]+$/, '');
    const trailingPunct = rawUrl.slice(stripped.length);

    // Push any plain text before this URL
    if (start > lastIndex) {
      segments.push({ type: 'text', value: text.slice(lastIndex, start) });
    }

    // Build a safe href — bare www. links need a protocol
    const href = stripped.startsWith('www.')
      ? `https://${stripped}`
      : stripped;

    segments.push({ type: 'url', value: stripped, href });

    // If we stripped trailing punctuation, put it back as plain text
    if (trailingPunct) {
      segments.push({ type: 'text', value: trailingPunct });
    }

    lastIndex = start + rawUrl.length;
  }

  // Remaining plain text after the last URL
  if (lastIndex < text.length) {
    segments.push({ type: 'text', value: text.slice(lastIndex) });
  }

  return segments;
}
