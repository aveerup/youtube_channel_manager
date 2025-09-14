const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({ apiKey: 'AIzaSyAN7ZPcmFsKdDeBKTIdd2iPynrQDatdK5I' });

const generateText = async (transcription, prompt) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `${transcription} ${prompt}? Just give me what is asked, no extra lines neede.`,
    });

    console.log("Generated Text:", response.text);

    return response.text;
  } catch (error) {
    console.error("Error generating text:", error);
    throw error;
  }
};

module.exports = { generateText };

// const text = "Introducing iPhone 17 Pro. To redefine pro, we had to start again with solid aluminium that's extruded, heated, forged, precision machined in finer and finer passes, then anodized for colour and durability to create our first aluminium unibody. A light, thermally efficient and rigid enclosure for the biggest battery with the longest battery life in any iPhone. The full width camera plateau elegantly integrates the antenna and encases a groundbreaking new pro camera system built for Apple intelligence. This is the most powerful chip ever made for any iPhone. But power generates heat. So we designed a new cooling system that cycles deionized water between liquid and gas within a vapor chamber laser welded to the chassis that rapidly dissipates heat throughout. "

// generateText(text, "Generate a concise and catchy YouTube video title for the above transcription").then((result)=>{console.log("Title:", result);});
// generateText(text, "Generate a detailed YouTube video description for the above transcription").then((result)=>{console.log("Description:", result);});
