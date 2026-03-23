import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import connectDB from "@/lib/mongodb";
import Meeting from "@/models/Meeting";
import { getUserFromRequest } from "@/lib/auth";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Map file extensions to MIME types
const MIME_MAP = {
  // Audio
  mp3: "audio/mpeg",
  wav: "audio/wav",
  m4a: "audio/mp4",
  ogg: "audio/ogg",
  webm: "audio/webm",
  flac: "audio/flac",
  // Video
  mp4: "video/mp4",
  mpeg: "video/mpeg",
  mov: "video/quicktime",
  avi: "video/x-msvideo",
  mpg: "video/mpeg",
  "3gp": "video/3gpp",
};

function getMimeType(fileName) {
  const ext = fileName.split(".").pop().toLowerCase();
  if (MIME_MAP[ext]) return MIME_MAP[ext];
  
  // Default fallbacks based on prefix if extension is weird
  if (["mp4", "mov", "avi", "mpg", "mpeg", "webm", "3gp"].includes(ext)) return `video/${ext === 'mov' ? 'quicktime' : ext}`;
  return "audio/mpeg";
}

/**
 * Transcribe media (audio or video) using Gemini's native understanding.
 */
async function transcribeMedia(base64Data, mimeType) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const result = await model.generateContent([
    {
      inlineData: {
        mimeType,
        data: base64Data,
      },
    },
    {
      text: "Please transcribe the spoken content from this media recording verbatim. Include all spoken words, noting different speakers if distinguishable. Output only the transcription text, nothing else.",
    },
  ]);

  const response = await result.response;
  return response.text();
}

/**
 * Summarize the transcript using Gemini and extract timestamps.
 */
async function summarizeTranscript(transcript) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `You are an expert meeting analyst. Analyze the following meeting transcript and provide a structured JSON response.

TRANSCRIPT:
${transcript}

You MUST return the response in the following JSON format ONLY. Do not include any text outside the JSON object.

FORMAT:
{
  "summary": "A concise 2-4 sentence summary of the meeting.",
  "keyPoints": ["Key point 1", "Key point 2", "Key point 3"],
  "actionItems": ["Action item 1", "Action item 2", "Action item 3"],
  "timestamps": ["MM:SS - Introduction", "MM:SS - Main topic discussion", "MM:SS - Conclusion"],
  "sentiment": {
    "overall": "Positive | Neutral | Negative",
    "reason": "Brief explanation for the detected sentiment."
  }
}

RULES:
- Provide 3-5 specific timestamps with descriptions based on the transcript's logical flow.
- If there are no clear action items, use ["No specific action items identified"].
- For sentiment, choose exactly one of: Positive, Neutral, Negative.
- Ensure the JSON is valid and properly escaped.`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

/**
 * Parse the JSON Gemini response.
 */
function parseGeminiResponse(text) {
  try {
    // Clean up potential markdown code blocks
    const cleanJson = text.replace(/```json|```/g, "").trim();
    const data = JSON.parse(cleanJson);
    
    return {
      summary: data.summary || "No summary generated.",
      keyPoints: Array.isArray(data.keyPoints) ? data.keyPoints : [],
      actionItems: Array.isArray(data.actionItems) ? data.actionItems : [],
      timestamps: Array.isArray(data.timestamps) ? data.timestamps : [],
      sentiment: data.sentiment || { overall: "Neutral", reason: "" },
    };
  } catch (error) {
    console.error("JSON Parse Error:", error, "Raw text:", text);
    // Fallback to empty structure if parsing fails
    return {
      summary: "Error parsing summary. The AI response was malformed.",
      keyPoints: [],
      actionItems: [],
      timestamps: [],
      sentiment: { overall: "Neutral", reason: "Parsing failure" },
    };
  }
}

export async function POST(request) {
  try {
    // Check authentication
    const decoded = await getUserFromRequest(request);
    if (!decoded) {
      return NextResponse.json(
        { error: "Not authorized. Please log in." },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const mediaFile = formData.get("media") || formData.get("audio");

    if (!mediaFile) {
      return NextResponse.json(
        { error: "No media file (audio or video) provided" },
        { status: 400 }
      );
    }

    // Validate file type
    const fileName = mediaFile.name || "recording.mp3";
    const ext = fileName.split(".").pop().toLowerCase();
    const allowedExtensions = Object.keys(MIME_MAP);

    if (!allowedExtensions.includes(ext)) {
      return NextResponse.json(
        { error: `Unsupported file format. Allowed: ${allowedExtensions.join(", ")}` },
        { status: 400 }
      );
    }

    // Convert file to base64
    const bytes = await mediaFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Data = buffer.toString("base64");
    const mimeType = getMimeType(fileName);

    // Step 1: Transcribe media with Gemini
    const transcript = await transcribeMedia(base64Data, mimeType);

    if (!transcript || transcript.trim().length === 0) {
      return NextResponse.json(
        { error: "Failed to transcribe recording. The file may be empty or has no clear speech." },
        { status: 422 }
      );
    }

    // Step 2: Summarize and extract key info
    const rawData = await summarizeTranscript(transcript);
    const { summary, keyPoints, actionItems, timestamps, sentiment } = parseGeminiResponse(rawData);

    // Step 3: Save to MongoDB
    await connectDB();

    const meeting = await Meeting.create({
      transcript,
      summary: summary || "No summary generated.",
      keyPoints: keyPoints.length > 0 ? keyPoints : ["No key points identified."],
      actionItems: actionItems.length > 0 ? actionItems : ["No action items identified."],
      timestamps: timestamps.length > 0 ? timestamps : ["No specific highlights identified."],
      sentiment,
      fileName,
      userId: decoded.userId,
    });

    return NextResponse.json({
      success: true,
      data: {
        _id: meeting._id,
        transcript: meeting.transcript,
        summary: meeting.summary,
        keyPoints: meeting.keyPoints,
        actionItems: meeting.actionItems,
        timestamps: meeting.timestamps,
        sentiment: meeting.sentiment,
        fileName: meeting.fileName,
        createdAt: meeting.createdAt,
      },
    });
  } catch (error) {
    console.error("Process API Error:", error);

    // Handle specific Gemini API errors
    if (error.message?.includes("API key")) {
      return NextResponse.json(
        { error: "Invalid Gemini API key. Please check your configuration." },
        { status: 401 }
      );
    }

    if (error.message?.includes("too large") || error.message?.includes("size")) {
      return NextResponse.json(
        { error: "File is too large. Please upload a smaller file (under 20MB)." },
        { status: 413 }
      );
    }

    return NextResponse.json(
      { error: error.message || "An unexpected error occurred while processing your recording." },
      { status: 500 }
    );
  }
}
