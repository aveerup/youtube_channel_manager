const {AssemblyAI} = require('assemblyai');

const client = new AssemblyAI({
                    apiKey: 'ff1d9d7620f04155b03b3556109ad219',
                    });

async function transcribeVideo(audioUrl, startTime, endTime) {
  try {
    // Create a transcript
    const transcript = await client.transcripts.transcribe({
      audio_url: audioUrl,
      language_code: 'en',
      audio_start_from: startTime, // in milliseconds
      audio_end_at: endTime,       // in milliseconds
    });

    // // Wait for transcription to complete
    // while (transcript.status !== 'completed' && transcript.status !== 'error') {
    //   await new Promise((resolve) => setTimeout(resolve, 3000)); // Wait 3 seconds
    //   const result = await client.transcripts.get(transcript.id);
      
    //   if (result.status === 'error') {
    //     throw new Error(`Transcription error: ${result.error}`);
    //   }
      
    //   if (result.status === 'completed') {
    //     return {
    //       id: result.id,
    //       text: result.text,
    //       confidence: result.confidence,
    //     };
    //   }
    // }

    if(transcript.status === 'error') {
      throw new Error(`Transcription error: ${transcript.error}`);
    }

    // console.log("Transcription successful:", transcript.text);

    return transcript.text;

  } catch (error) {
    console.error('Transcription error:', error);
    throw error;
  }
}

module.exports = { transcribeVideo };