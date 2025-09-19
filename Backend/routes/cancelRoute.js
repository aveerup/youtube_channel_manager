const router = require('express').Router();
const { pgPool } = require('../db/supabase');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });

router.post('/cancel', async (req, res) => {
  try {
    const { videoId } = req.body;

    // Validate input
    if (!videoId) {
      return res.status(400).json({ error: 'Video ID is required' });
    }

    // Update video status to 'canceled'
    const result = await pgPool.query(
      `DELETE FROM videos WHERE id = $1 RETURNING *`,
      [videoId]
    );

    cloudinary.api.delete_resources([result.rows[0].cloudinary_id], { resource_type: 'video' }, (error, result) => {
      if (error) {
        console.error('Cloudinary deletion error:', error);
      } else {
        console.log('Cloudinary deletion result:', result);
      }
    });

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Video not found' });
    }

    res.json({ message: 'Video upload canceled successfully', video: result.rows[0] });

  } catch (error) {
    console.error('Cancel route error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;