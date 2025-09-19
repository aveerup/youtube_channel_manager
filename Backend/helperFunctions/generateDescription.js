const {generateText} = require('./textGenerationGemini.js');
const {transcribeVideo} = require('./transcribe.js');

let descriptionPrompt = "Describe the gven text concisely in 2-3 lines.";

const generateDescription = async (audioUrl, duration) => {

    let description = "";

    if(duration >= 300000){
        let timeStamp = Math.floor(duration/5);

        for(let i=1; i<=5; i++){
            // Call Gemini API with transcription and timeStamp*i
            let transcriptionSegment = await transcribeVideo(audioUrl, i*timeStamp - 60000, i*timeStamp);
            description += await generateText(transcriptionSegment, "Describe the gven text concisely in 2-3 lines.");
        }   

        description += " ";
    }else if(duration >= 180000 && duration < 300000){
        let timeStamp = Math.floor(duration/3);

        for (let i=1; i<=3; i++){
            // Call Gemini API with transcription and timeStamp*i
            let transcriptionSegment = await transcribeVideo(audioUrl, i*timeStamp - 60000, i*timeStamp);
            description += await generateText(transcriptionSegment, "Describe the gven text concisely in 2-3 lines.");        
            
            console.log("Transcription Segment:", transcriptionSegment);
            console.log("description Segment:", description);

            description += " ";
        }   
    }else if(duration >= 90000 && duration < 180000){
        let timeStamp = Math.floor(duration/2);

        let transcriptionSegment = await transcribeVideo(audioUrl, 0, timeStamp);
        description += await generateText(transcriptionSegment, descriptionPrompt);
        description += " ";
        
        transcriptionSegment = await transcribeVideo(audioUrl, timeStamp, duration);
        description += await generateText(transcriptionSegment, descriptionPrompt);
    
    }else{
        let transcription = await transcribeVideo(audioUrl, 0, duration);
        description += await generateText(transcription, "Describe the gven text concisely in 2-3 lines.");
    }

    console.log("Combined description before final generation:", description);
    description = await generateText(description, "Generate a detailed YouTube video description for a video that talks about the above topics. If possible include different timestamps of the video based on topic. only the description is needed.");

    return description;
}

module.exports = { generateDescription };