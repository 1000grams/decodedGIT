exports.handler = async (event) => {
  console.log("Spotify handler triggered");
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Spotify endpoint working!" }),
  };
};
