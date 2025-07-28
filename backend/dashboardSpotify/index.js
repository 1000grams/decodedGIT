const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json'
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' };
  }
  console.log("Spotify handler triggered");
  return {
    statusCode: 200,
    headers: corsHeaders,
    body: JSON.stringify({ message: "Spotify endpoint working!" }),
  };
};
