const {generateText} = require('./textGenerationGemini.js');
const {transcribeVideo} = require('./transcribe.js');

const generateTitle = async (audioUrl, duration) => {

    let title = "";

    if(duration >= 300000){
        let timeStamp = Math.floor(duration/5);

        for(let i=1; i<=5; i++){
            // Call Gemini API with transcription and timeStamp*i
            let transcriptionSegment = await transcribeVideo(audioUrl, i*timeStamp - 60000, i*timeStamp);
            title += await generateText(transcriptionSegment, "What is the given segment about? describe in one line.");
        }   

        title += " ";
    }else if(duration >= 180000 && duration < 300000){
        let timeStamp = Math.floor(duration/3);

        for (let i=1; i<=3; i++){
            // Call Gemini API with transcription and timeStamp*i
            let transcriptionSegment = await transcribeVideo(audioUrl, i*timeStamp - 60000, i*timeStamp);
            title += await generateText(transcriptionSegment, "What is the given segment about? describe in one line.");        
            
            console.log("Transcription Segment:", transcriptionSegment);
            console.log("Title Segment:", title);

            title += " ";
        }   
    }else if(duration >= 90000 && duration < 180000){
        let timeStamp = Math.floor(duration/2);

        let transcriptionSegment = await transcribeVideo(audioUrl, 0, timeStamp);
        title += await generateText(transcriptionSegment, "What is the given segment about? describe in one line.");
        title += " ";
        
        transcriptionSegment = await transcribeVideo(audioUrl, timeStamp, duration);
        title += await generateText(transcriptionSegment, "What is the given segment about? describe in one line.");
    
    }else{
        let transcription = await transcribeVideo(audioUrl, 0, duration);
        title += await generateText(transcription, "Generate a concise and catchy YouTube video title for the above transcription");
    }

    console.log("Combined Title before final generation:", title);
    title = await generateText(title, "Generate a concise and catchy YouTube video title for a video that talks about the above topics. only the tile is needed.");

    return title;
}

module.exports = { generateTitle };