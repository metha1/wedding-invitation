const fs = require('fs');
const path = require('path');

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const rsvp = JSON.parse(event.body);

    // In a real deployment, you'd use a database
    // For now, we'll store in a JSON file (this won't persist across deployments)
    const dataDir = '/tmp'; // Netlify functions can write to /tmp
    const rsvpsFile = path.join(dataDir, 'rsvps.json');

    // Read existing RSVPs
    let rsvps = [];
    try {
      if (fs.existsSync(rsvpsFile)) {
        rsvps = JSON.parse(fs.readFileSync(rsvpsFile, 'utf8'));
      }
    } catch (err) {
      console.log('No existing RSVPs file');
    }

    // Add new RSVP
    rsvps.push({
      ...rsvp,
      id: Date.now().toString(),
      ip: event.headers['x-forwarded-for'] || event.headers['client-ip'] || 'unknown'
    });

    // Save back to file
    fs.writeFileSync(rsvpsFile, JSON.stringify(rsvps, null, 2));

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: 'RSVP saved successfully' })
    };

  } catch (error) {
    console.error('RSVP save error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to save RSVP' })
    };
  }
};