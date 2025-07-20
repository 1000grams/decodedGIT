// Removed 'path' module and Python script path references
export async function runGrowthDashboard(args) {
  const artistId = args?.[0]?.split('=')[1];
  const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/analytics?artistId=${artistId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch analytics');
  }
  return await response.text(); // Returns JSON string
}
