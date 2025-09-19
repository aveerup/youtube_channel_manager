const router = require('express').Router();
const { generateTitle } = require('../helperFunctions/generateTitle.js');
const { pgPool } = require('../db/supabase');
const { extractAudioUrl } = require('../helperFunctions/extractAudio.js');

router.post('/generate/title', async (req, res) => {
  try {
    const { id, duration, cloudinary_id } = req.body;
    if (!id || !duration || !cloudinary_id) {
      return res.status(400).json({ error: 'Title and video URL are required' });
    }

    const audioUrl = extractAudioUrl(cloudinary_id);
    
    const title = await generateTitle(audioUrl, duration*1000);

    // save to database
    const result = await pgPool.query(
        `UPDATE videos
         SET title = $1
         WHERE id = $2
         RETURNING *`,
        [title, id]
    );

    res.json({ title, ...result.rows[0] });
  } catch (error) {
    console.error('Error generating description:', error);
    res.status(500).json({ error: error.message });
    }
});

module.exports = router;