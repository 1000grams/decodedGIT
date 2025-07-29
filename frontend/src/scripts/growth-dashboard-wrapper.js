// Removed 'path' module and Python script path references
export async function runGrowthDashboard(args) {
  const artistId = args?.[0]?.split('=')[1];
  const response = await fetch(
    `${process.env.REACT_APP_API_BASE}/analytics?artistId=${artistId}`
  );
  if (!response.ok) {
    throw new Error('Failed to fetch analytics');
  }

  try {
    return await response.json();
  } catch (err) {
    const text = await response.text();
    throw new Error(`Invalid JSON response: ${text}`);
  }
}
