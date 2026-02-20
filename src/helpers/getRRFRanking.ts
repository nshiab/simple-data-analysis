/**
 * Executes Reciprocal Rank Fusion and returns only the sorted document IDs.
 * @param results - An array of string arrays (e.g., [[id1, id2], [id2, id3]])
 * @param k - The smoothing constant (default 60)
 * @returns A flat array of document IDs sorted by their fused rank.
 */
export default function getRRFRanking(
  results: string[][],
  k: number = 60,
): string[] {
  const scoreMap: Map<string, number> = new Map();

  results.forEach((resultSet) => {
    resultSet.forEach((id, index) => {
      const rank = index + 1;
      const currentScore = scoreMap.get(id) || 0;

      // Add the RRF score to the existing total for this ID
      scoreMap.set(id, currentScore + (1 / (k + rank)));
    });
  });

  // Sort by score descending and return only the IDs
  return Array.from(scoreMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => id);
}
