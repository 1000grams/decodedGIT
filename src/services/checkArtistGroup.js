export async function checkArtistGroup(email) {
  const res = await fetch("https://2h2oj7u446.execute-api.eu-central-1.amazonaws.com/prod/auth/groupcheck", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  const data = await res.json();
  return data.authorized;
}
