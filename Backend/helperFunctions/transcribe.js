const {AssemblyAI} = require('assemblyai');

const client = new AssemblyAI({apiKey: process.env.ASSEMBLYAI_API_KEY,});

async function transcribeVideo(audioUrl, startTime, endTime) {
  try {
    // audio_start_from and audio_end_at should be integers
    startTime = Math.floor(startTime);
    endTime = Math.floor(endTime);

    // Create a transcript
    const transcript = await client.transcripts.transcribe({
      audio_url: audioUrl,
      language_code: 'en',
      audio_start_from: startTime, // in milliseconds
      audio_end_at: endTime,       // in milliseconds
    });

    if(transcript.status === 'error') {
      throw new Error(`Transcription error: ${transcript.error}`);
    }

    return transcript.text;

  } catch (error) {
    console.error('Transcription error:', error);
    throw error;
  }
}

module.exports = { transcribeVideo };