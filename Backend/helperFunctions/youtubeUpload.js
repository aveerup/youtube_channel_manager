const { google } = require('googleapis');
const OAuth2 = google.auth.OAuth2;
const fs = require('fs');
const axios = require('axios');
const path = require('path');
const { pgPool } = require('../db/supabase');

const oauth2Client = new OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.BACKEND_URL}/auth/google/callback`
);

const youtube = google.youtube('v3');

async function downloadVideo(url, fileName) {
  const response = await axios({
    method: 'GET',
    url: url,
    responseType: 'stream'
  });

  const filePath = path.join(__dirname, '../uploads', fileName);
  const writer = fs.createWriteStream(filePath);

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', () => resolve(filePath));
    writer.on('error', reject);
  });
}

async function uploadToYoutube(videoData) {
  try {
    const { videoUrl, title, description, keywords, accessToken, refreshToken, published_at, expire_date } = videoData;

    // Download video from Cloudinary
    const fileName = `temp-${Date.now()}.mp4`;
    const videoPath = await downloadVideo(videoUrl, fileName);

    // Set credentials with both tokens
    oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
      expiry_date: new Date(expire_date).getTime() // expected expiry time of access_token in milliseconds
    });

    const { token } = await oauth2Client.getAccessToken();

    await pgPool.query(
      `UPDATE users 
        SET access_token = $1, expire_date = $2 
        WHERE refresh_token = $3
        RETURNING *`,
      [oauth2Client.credentials.access_token, new Date(oauth2Client.credentials.expiry_date), refreshToken]
    )
        
    console.log('keywords:', keywords.split(",").map(tag => tag.trim()).filter((tag, index, self) => tag && self.indexOf(tag) === index));

    // Upload video to YouTube
    const res = await youtube.videos.insert({
      auth: oauth2Client,
      part: 'snippet,status',
      requestBody: {
        snippet: {
          title,
          description,
          tags: keywords? keywords.split(",").map(tag => tag.trim()).filter((tag, index, self) => tag && self.indexOf(tag) === index).slice(0, 5) : [],
          defaultLanguage: 'en',
          defaultAudioLanguage: 'en'
        },
        status: {
          privacyStatus: published_at ? 'private' : 'public',
          publishAt: published_at ? published_at : undefined, 
          selfDeclaredMadeForKids: false
        }
      },
      media: {
        body: fs.createReadStream(videoPath)
      }
    });

    // Clean up: delete temporary file
    fs.unlink(videoPath, (err) => {
      if (err) console.error('Error deleting temp file:', err);
    });

    return res.data;
  } catch (error) {
    console.error('YouTube upload error:', error.message);
    if (error.response) {
      console.error('Error details:', error.response.data);
    }
    throw error;
  }
}

module.exports = { uploadToYoutube };