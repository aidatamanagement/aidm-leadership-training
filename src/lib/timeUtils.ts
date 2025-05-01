
/**
 * Formats time in seconds to a human-readable string (e.g., "1h 10m 25s")
 */
export function formatTimeSpent(seconds: number): string {
  if (!seconds || seconds <= 0) return '0s';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  let formattedTime = '';
  
  if (hours > 0) {
    formattedTime += `${hours}h `;
  }
  
  if (minutes > 0 || hours > 0) {
    formattedTime += `${minutes}m `;
  }
  
  formattedTime += `${remainingSeconds}s`;
  
  return formattedTime;
}
