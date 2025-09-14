const {generateText} = require('./textGenerationGemini.js');
const {transcribeVideo} = require('./transcribe.js');

const generateKeyWords = async (audioUrl, duration) => {

    let keyWords = "";

    if(duration >= 300000){
        let timeStamp = Math.floor(duration/5);

        for(let i=1; i<=5; i++){
            // Call Gemini API with transcription and timeStamp*i
            let transcriptionSegment = await transcribeVideo(audioUrl, i*timeStamp - 60000, i*timeStamp);
            keyWords += await generateText(transcriptionSegment, "Give me the keywords related to the above segment in comma separated format.");
        }   

        keyWords += ",";

    }else if(duration >= 180000 && duration < 300000){
        let timeStamp = Math.floor(duration/3);

        for (let i=1; i<=3; i++){
            // Call Gemini API with transcription and timeStamp*i
            let transcriptionSegment = await transcribeVideo(audioUrl, i*timeStamp - 60000, i*timeStamp);
            keyWords += await generateText(transcriptionSegment, "Give me the keywords related to the above segment in comma separated format.");        
            
            console.log("Transcription Segment:", transcriptionSegment);
            console.log("description Segment:", keyWords);

            keyWords += ",";
        }   
    }else if(duration >= 90000 && duration < 180000){
        let timeStamp = Math.floor(duration/2);

        let transcriptionSegment = await transcribeVideo(audioUrl, 0, timeStamp);
        keyWords += await generateText(transcriptionSegment, "Give me the keywords related to the above segment in comma separated format.");
        keyWords += ",";
        
        transcriptionSegment = await transcribeVideo(audioUrl, timeStamp, duration);
        keyWords += await generateText(transcriptionSegment, "Give me the keywords related to the above segment in comma separated format.");
    
    }else{
        let transcription = await transcribeVideo(audioUrl, 0, duration);
        keyWords += await generateText(transcription, "Give me the keywords related to the above segment in comma separated format.");
    }

    console.log("Combined keyWords:", keyWords);

    return keyWords;
}

module.exports = { generateKeyWords };