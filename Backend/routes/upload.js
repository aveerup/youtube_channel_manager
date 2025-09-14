const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
const {extractAudioUrl} = require('./extractAudio.js');
const {transcribeVideo} = require('./transcribe.js');
const {generateText} = require('./textGenerationGemini.js');
const {generateTitle} = require('./generateTitle.js');
const { generateDescription } = require('./generateDescription.js');
const { generateKeyWords } = require('./generateKeyWords.js');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

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

    // Delete local file
    fs.unlink(req.file.path, (err) => {
      if (err) console.error('Error deleting local file:', err);
    });

    const audioUrl = extractAudioUrl(cloudinaryResult.public_id); // For testing
    
    const title = await generateTitle(audioUrl, cloudinaryResult.duration * 1000); // duration in ms
    const description = await generateDescription(audioUrl, cloudinaryResult.duration * 1000);
    const keyWords = await generateKeyWords(audioUrl, cloudinaryResult.duration * 1000);
    // const transcription = await transcribeVideo(audioUrl);

    // console.log("Transcription Result:", transcription); // For testing

    // const title = await generateText(transcription, "Generate a concise and catchy YouTube video title for the above transcription");
    // const description = await generateText(transcription, "Generate a detailed YouTube video description for the above transcription");
    
    console.log("Generated Title:", title); // For testing
    // console.log("Generated Description:", description); // For testing
    // console.log(req); // Check if user info is available

    // Store video info in Supabase
    const { data, error } = await supabase
      .from('videos')
      .insert([
        {
          user_id: req.user.id, // Assuming you have user info from auth
          title: req.file.originalname,
          cloudinary_id: cloudinaryResult.public_id,
          cloudinary_url: cloudinaryResult.secure_url,
          duration: cloudinaryResult.duration,
        }
      ])
      .select();

    if (error) throw error;

    res.json({
      message: 'File uploaded successfully',
      video: {
        url: cloudinaryResult.secure_url,
        ...data[0]
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;