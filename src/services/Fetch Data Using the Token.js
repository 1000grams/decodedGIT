const fetchDashboardData = async () => {
  const token = localStorage.getItem("cognito_id_token");

  if (!token) {
    console.error("No Cognito token found. Please log in.");
    return;
  }

  try {
    const response = await fetch("https://2h2oj7u446.execute-api.eu-central-1.amazonaws.com/prod/dashboard", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log("Dashboard data:", data);
  } catch (err) {
    console.error("API error", err);
  }
};

// Call the function to fetch data
fetchDashboardData();