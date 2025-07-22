const AWS = require("aws-sdk");
const ses = new AWS.SES({ region: "eu-central-1" });

exports.handler = async (event) => {
  const data = JSON.parse(event.body);

  const emailBody = `
Subject: Pitch: “${data.track_title}” by Rue de Vivre — Perfect for ${data.brand_or_game}

Hi ${data.recipient_name_or_team},

I’m Rue de Vivre, and I’d love to share my track “${data.track_title}” for your ${data.brand_or_game}. Here’s why it fits:

${data.theme_bullets}

Listen: ${data.preview_link}
Full Track (WAV/MP3/Stems): ${data.download_link}

ASCAP Publisher Details

IPI Base #: ${data.ascap_ipi_base}
ASCAP Work ID: ${data.ascap_work_id}

If you’re interested, just reply with:

- Desired license term (e.g. exclusive/non-exclusive)
- Usage details (scene, duration, territories)
- Any special delivery format (stems, stems+dry vocal, stems+wet vocal)

Best,
Rue de Vivre  
ops@decodedmusic.com  
www.decodedmusic.com`;

  const target = process.env.PITCH_TARGET_EMAIL || 'ops@decodedmusic.com';
  const params = {
    Destination: { ToAddresses: [target] },
    Message: {
      Subject: { Data: 'SYNC' },
      Body: { Text: { Data: emailBody } },
    },
    Source: "ops@decodedmusic.com",
  };

  await ses.sendEmail(params).promise();

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Pitch sent." }),
    headers: { "Access-Control-Allow-Origin": "*" },
  };
};
