/**
 * Wraps a string to a specified maximum width, attempting to break at word boundaries when possible.
 * If a single word exceeds the maximum width, it will be broken at the character boundary.
 * This function is primarily used for preparing text to be displayed in console tables.
 *
 * @param str - The string to wrap.
 * @param maxWidth - The maximum width of each line.
 * @param wordWrap - If true, attempts to break at word boundaries. If false, breaks at character boundaries. Defaults to true.
 * @returns The wrapped string with newline characters inserted at appropriate positions.
 *
 * @example
 * ```typescript
 * const text = "This is a very long sentence that needs to be wrapped";
 * const wrapped = wrapString(text, 20);
 * console.log(wrapped);
 * // Output:
 * // This is a very long
 * // sentence that needs
 * // to be wrapped
 * ```
 *
 * @example
 * ```typescript
 * // Character-based wrapping (no word boundaries)
 * const text = "Thisisaverylongword";
 * const wrapped = wrapString(text, 10, false);
 * // Output: Thisisaver / ylongword
 * ```
 */
export default function wrapString(
  str: string,
  maxWidth: number,
  wordWrap = true,
): string {
  if (str.length <= maxWidth) {
    return str;
  }

  if (!wordWrap) {
    // Simple character-based wrapping
    const lines: string[] = [];
    for (let i = 0; i < str.length; i += maxWidth) {
      lines.push(str.slice(i, i + maxWidth));
    }
    return lines.join("\n");
  }

  // Word-aware wrapping
  const lines: string[] = [];
  let currentLine = "";

  const words = str.split(/(\s+)/); // Split but keep whitespace

  for (const word of words) {
    // If adding this word would exceed maxWidth
    if (currentLine.length + word.length > maxWidth) {
      // If current line is not empty, save it
      if (currentLine.length > 0) {
        lines.push(currentLine.trimEnd());
        currentLine = "";
      }

      // If the word itself is longer than maxWidth, break it
      if (word.length > maxWidth) {
        for (let i = 0; i < word.length; i += maxWidth) {
          const chunk = word.slice(i, i + maxWidth);
          if (i + maxWidth < word.length) {
            lines.push(chunk);
          } else {
            currentLine = chunk;
          }
        }
      } else {
        currentLine = word;
      }
    } else {
      currentLine += word;
    }
  }

  // Add any remaining text
  if (currentLine.length > 0) {
    lines.push(currentLine.trimEnd());
  }

  return lines.join("\n");
}
