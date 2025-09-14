const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


const extractAudioUrl = (publicId)=>{
    const audioUrl = cloudinary.url(publicId, {
        resource_type: "video",   // still "video", because source is video
        format: "mp3",            // or "wav", "aac", etc.
        transformation: [
          { resource_type: "video", audio_codec: "mp3" }
        ]
    });

    console.log("Extracted Audio URL:", audioUrl);

    return audioUrl;
}

module.exports = { extractAudioUrl };
