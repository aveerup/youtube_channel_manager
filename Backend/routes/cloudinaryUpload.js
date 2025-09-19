const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const { pgPool } = require('../db/supabase.js');
const { extractAudioUrl } = require('../helperFunctions/extractAudio.js');
const { generateTitle } = require('../helperFunctions/generateTitle.js');
const { generateDescription } = require('../helperFunctions/generateDescription.js');
const { generateKeyWords } = require('../helperFunctions/generateKeyWords.js');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer for temporary storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 100 // 100 MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Not a video file!'), false);
    }
  }
});

router.post('/upload', upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Upload to Cloudinary
    const cloudinaryResult = await cloudinary.uploader.upload(req.file.path, {
      resource_type: 'video',
      folder: 'youtube_agent_videos'
    });

    console.log(cloudinaryResult);

    // Delete local file
    fs.unlink(req.file.path, (err) => {
      if (err) console.error('Error deleting local file:', err);
    });

    const audioUrl = extractAudioUrl(cloudinaryResult.public_id);
    
    const title = await generateTitle(audioUrl, cloudinaryResult.duration * 1000);
    const description = await generateDescription(audioUrl, cloudinaryResult.duration * 1000);
    const keyWords = await generateKeyWords(audioUrl, cloudinaryResult.duration * 1000);
    
    // Store video info using pgPool
    const result = await pgPool.query(
      `INSERT INTO videos 
       ( user_id, title, description, keywords, cloudinary_id, cloudinary_url, duration, created_at) 
       VALUES 
       ($1, $2, $3, $4, $5, $6, $7, NOW())
       RETURNING *`,
      [
        req.user.id,
        title,
        description,
        keyWords,
        cloudinaryResult.public_id,
        cloudinaryResult.secure_url,
        cloudinaryResult.duration
      ]
    );

    const insertedVideo = result.rows[0];

    res.json({
      message: 'File uploaded successfully',
      video: {
        url: cloudinaryResult.secure_url,
        ...insertedVideo,
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;