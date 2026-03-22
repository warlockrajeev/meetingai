import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import connectDB from "@/lib/mongodb";
import Meeting from "@/models/Meeting";
import { getUserFromRequest } from "@/lib/auth";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Map file extensions to MIME types
const MIME_MAP = {
  mp3: "audio/mpeg",
  wav: "audio/wav",
  m4a: "audio/mp4",
  ogg: "audio/ogg",
  webm: "audio/webm",
  flac: "audio/flac",
};

function getMimeType(fileName) {
  const ext = fileName.split(".").pop().toLowerCase();
  return MIME_MAP[ext] || "audio/mpeg";
}

/**
 * Transcribe audio using Gemini's native audio understanding.
 */
async function transcribeAudio(base64Audio, mimeType) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const result = await model.generateContent([
    {
      inlineData: {
        mimeType,
        data: base64Audio,
      },
    },
    {
      text: "Please transcribe this audio recording verbatim. Include all spoken words, noting different speakers if distinguishable. Output only the transcription text, nothing else.",
    },
  ]);

  const response = await result.response;
  return response.text();
}

/**
 * Summarize the transcript using Gemini.
 */
async function summarizeTranscript(transcript) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `You are an expert meeting analyst. Analyze the following meeting transcript and provide a structured summary.

TRANSCRIPT:
${transcript}

Please provide the output in EXACTLY this format (use these exact headers):

SUMMARY:
[A concise 2-4 sentence summary of the meeting]

KEY POINTS:
- [Key point 1]
- [Key point 2]
- [Key point 3]
(add more as needed)

ACTION ITEMS:
- [Action item 1]
- [Action item 2]
- [Action item 3]
(add more as needed)

If there are no clear action items, write "- No specific action items identified"
If there are no clear key points, write "- No specific key points identified"`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

/**
 * Parse the structured Gemini response into sections.
 */
function parseGeminiResponse(text) {
  let summary = "";
  let keyPoints = [];
  let actionItems = [];

  // Extract Summary
  const summaryMatch = text.match(/SUMMARY:\s*([\s\S]*?)(?=KEY POINTS:|$)/i);
  if (summaryMatch) {
    summary = summaryMatch[1].trim();
  }

  // Extract Key Points
  const keyPointsMatch = text.match(/KEY POINTS:\s*([\s\S]*?)(?=ACTION ITEMS:|$)/i);
  if (keyPointsMatch) {
    keyPoints = keyPointsMatch[1]
      .split("\n")
      .map((line) => line.replace(/^[-*•]\s*/, "").trim())
      .filter((line) => line.length > 0);
  }

  // Extract Action Items
  const actionItemsMatch = text.match(/ACTION ITEMS:\s*([\s\S]*?)$/i);
  if (actionItemsMatch) {
    actionItems = actionItemsMatch[1]
      .split("\n")
      .map((line) => line.replace(/^[-*•]\s*/, "").trim())
      .filter((line) => line.length > 0);
  }

  return { summary, keyPoints, actionItems };
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
    const audioFile = formData.get("audio");

    if (!audioFile) {
      return NextResponse.json(
        { error: "No audio file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    const fileName = audioFile.name || "audio.mp3";
    const ext = fileName.split(".").pop().toLowerCase();
    const allowedExtensions = Object.keys(MIME_MAP);

    if (!allowedExtensions.includes(ext)) {
      return NextResponse.json(
        { error: `Unsupported file format. Allowed: ${allowedExtensions.join(", ")}` },
        { status: 400 }
      );
    }

    // Convert file to base64
    const bytes = await audioFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Audio = buffer.toString("base64");
    const mimeType = getMimeType(fileName);

    // Step 1: Transcribe audio with Gemini
    const transcript = await transcribeAudio(base64Audio, mimeType);

    if (!transcript || transcript.trim().length === 0) {
      return NextResponse.json(
        { error: "Failed to transcribe audio. The file may be empty or corrupted." },
        { status: 422 }
      );
    }

    // Step 2: Summarize and extract key info
    const rawSummary = await summarizeTranscript(transcript);
    const { summary, keyPoints, actionItems } = parseGeminiResponse(rawSummary);

    // Step 3: Save to MongoDB
    await connectDB();

    const meeting = await Meeting.create({
      transcript,
      summary: summary || "No summary generated.",
      keyPoints: keyPoints.length > 0 ? keyPoints : ["No key points identified."],
      actionItems: actionItems.length > 0 ? actionItems : ["No action items identified."],
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
        { error: "Audio file is too large. Please upload a smaller file (under 20MB)." },
        { status: 413 }
      );
    }

    return NextResponse.json(
      { error: error.message || "An unexpected error occurred while processing your audio." },
      { status: 500 }
    );
  }
}
