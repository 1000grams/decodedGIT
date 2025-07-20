exports.handler = async () => {
  try {
    const defaultTeam = [
      { name: 'Owner', role: 'Admin' },
      { name: 'Collaborator', role: 'Contributor' }
    ];
    const team = process.env.TEAM_JSON ? JSON.parse(process.env.TEAM_JSON) : defaultTeam;
    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(team)
    };
  } catch (err) {
    console.error('team error', err);
    return { statusCode: 500, body: JSON.stringify({ message: 'Internal Server Error' }) };
  }
};
