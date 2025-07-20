export async function verifyBackendConnection(apiUrl) {
  try {
    const response = await fetch(`${apiUrl}/health`, { method: "GET" });
    if (!response.ok) {
      throw new Error(`Status: ${response.status}`);
    }
    return { success: true, status: response.status };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
