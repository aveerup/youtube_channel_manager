const { google } = require('googleapis');
const OAuth2 = google.auth.OAuth2;
const { pgPool } = require('../db/supabase');

const oauth2Client = new OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.BACKEND_URL}/auth/google/callback`
);

const youtube = google.youtube('v3');

async function getChannelData(accessToken, refreshToken, expire_date) {
  try {
    oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
      expiry_date: new Date(expire_date).getTime() // Convert to milliseconds timestamp
    });

    // Force token refresh if needed
    const { token } = await oauth2Client.getAccessToken();
    console.log('Refreshed Tokens:', token);
    console.log('Credentials after refresh:', oauth2Client.credentials);

    // Update tokens in database
    await pgPool.query(
      `UPDATE users 
       SET access_token = $1, 
           expire_date = $2 
       WHERE refresh_token = $3
       RETURNING *`,
      [
        oauth2Client.credentials.access_token,
        new Date(oauth2Client.credentials.expiry_date),
        refreshToken
      ]
    );

    // Get channel details
    const channelResponse = await youtube.channels.list({
      auth: oauth2Client,
      part: ['snippet, contentDetails, statistics'],
      mine: true
    });

    if (!channelResponse.data.items || channelResponse.data.items.length === 0) {
      throw new Error('No channel found');
    }

    const channel = channelResponse.data.items[0];

    console.log('Channel ID:', channel.id);

    // Get recent videos
    const videosResponse = await youtube.search.list({
      auth: oauth2Client,
      part: ['snippet'],
      channelId: channel.id,
      order: 'date',
      maxResults: 10,
      type: 'video'
    });

    console.log('Recent Videos:', videosResponse.data.items);
    
    return {
      channelInfo: {
        id: channel.id,
        title: channel.snippet.title,
        description: channel.snippet.description,
        customUrl: channel.snippet.customUrl,
        thumbnails: channel.snippet.thumbnails,
        statistics: channel.statistics
      },
      recentVideos: videosResponse.data.items,
    };
  } catch (error) {
    console.error('Error fetching channel data:', error);
    throw error;
  }
}

module.exports = { getChannelData };