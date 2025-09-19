const express = require('express');
const router = express.Router();
const { uploadToYoutube } = require('../helperFunctions/youtubeUpload.js');
const { pgPool } = require('../db/supabase.js');

router.post('/youtube/upload', async (req, res) => {
  try {
    let { videoId, published_at } = req.body;

    // Validate publishAt format if provided
    if (published_at) {
      const publishDate = new Date(published_at);
      if (isNaN(publishDate.getTime())) {
        return res.status(400).json({ error: 'Invalid publish date format' });
      }
      
      // Ensure publish time is in the future
      if (publishDate <= new Date()) {
        return res.status(400).json({ error: 'Publish time must be in the future' });
      }
    }
    
    // Get video data using pgPool
    const videoResult = await pgPool.query(
      `SELECT * FROM videos WHERE id = $1`,
      [videoId]
    );

    if (videoResult.rows.length === 0) {
      throw new Error('Video not found');
    }
    const video = videoResult.rows[0];

    // Get user tokens using pgPool
    const userResult = await pgPool.query(
      `SELECT access_token, refresh_token, expire_date 
       FROM users 
       WHERE id = $1`,
      [req.user.id]
    );

    if (userResult.rows.length === 0) {
      throw new Error('User not found');
    }
    const user = userResult.rows[0];

    // Upload to YouTube with both tokens
    const youtubeData = await uploadToYoutube({
      videoUrl: video.cloudinary_url,
      title: video.title,
      description: video.description,
      keywords: video.keywords,
      accessToken: user.access_token,
      refreshToken: user.refresh_token,
      published_at: published_at,
      expire_date: user.expire_date
    });

    // Update database with YouTube info using pgPool
    await pgPool.query(
      `UPDATE videos 
       SET youtube_id = $1, 
           youtube_url = $2, 
           published_at = $3 
       WHERE id = $4`,
      [
        youtubeData.id,
        `https://youtube.com/watch?v=${youtubeData.id}`,
        published_at? published_at : new Date().toISOString(),
        videoId
      ]
    );

    res.json({
      message: 'Video uploaded to YouTube successfully',
      youtubeData
    });

  } catch (error) {
    console.error('Route error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;