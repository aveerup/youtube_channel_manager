const { google } = require('googleapis');
const OAuth2 = google.auth.OAuth2;

const oauth2Client = new OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.BACKEND_URL}/auth/google/callback`
);

const youtube = google.youtube('v3');

async function uploadToYoutube(videoData) {
  try {
    const { videoUrl, title, description, keywords, accessToken } = videoData;

    // Set credentials
    oauth2Client.setCredentials({
      access_token: accessToken
    });

    // Upload video
    const res = await youtube.videos.insert({
      auth: oauth2Client,
      part: 'snippet,status',
      requestBody: {
        snippet: {
          title,
          description,
          tags: keywords,
          defaultLanguage: 'en',
          defaultAudioLanguage: 'en'
        },
        status: {
          privacyStatus: 'private' // or 'public', 'unlisted'
        }
      },
      media: {
        body: videoUrl
      }
    });

    return res.data;
  } catch (error) {
    console.error('YouTube upload error:', error);
    throw error;
  }
}

module.exports = { uploadToYoutube };