/**
 * Calculate the difference between two dates in hh:mm::ss format
 * Anything beyond 24 hours of difference is incompatible and will overflow
 * @param {string} start datetime script
 * @param {string} end datetime string
 * @returns {string} pretty time diff in hh:mm::ss format
 */
export default function calculateTimeTaken(start, end) {
  const startMs = Date.parse(start);
  const endMs = Date.parse(end);

  if (!(startMs > 0) || !(endMs > 0)) return "-";

  const diff = endMs - startMs;

  return new Date(diff).toISOString().substring(11, 11 + 8);
}
