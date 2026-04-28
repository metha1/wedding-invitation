const fs = require('fs');
const path = require('path');

exports.handler = async (event, context) => {
  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const dataDir = '/tmp'; // Netlify functions can write to /tmp
    const rsvpsFile = path.join(dataDir, 'rsvps.json');

    let rsvps = [];
    try {
      if (fs.existsSync(rsvpsFile)) {
        rsvps = JSON.parse(fs.readFileSync(rsvpsFile, 'utf8'));
      }
    } catch (err) {
      console.log('No RSVPs file found');
    }

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
      },
      body: JSON.stringify(rsvps)
    };

  } catch (error) {
    console.error('RSVP fetch error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch RSVPs' })
    };
  }
};