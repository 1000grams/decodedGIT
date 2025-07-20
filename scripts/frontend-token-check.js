// Validate React frontend token usage
const token = localStorage.getItem("cognito_id_token");

if (!token) {
    console.error("❌ No Cognito token found in localStorage");
} else {
    console.log("✅ Cognito token found: ", token);

    fetch("https://your-api.amazonaws.com/prod/dashboard/catalog", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })
        .then((res) => {
            if (res.ok) {
                console.log("✅ API call succeeded");
            } else {
                console.error("❌ API call failed: ", res.statusText);
            }
        })
        .catch((err) => console.error("❌ Fetch error: ", err));
}
