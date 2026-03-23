import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getUserFromRequest } from "@/lib/auth";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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

    const { question, transcript } = await request.json();

    if (!question || !transcript) {
      return NextResponse.json(
        { error: "Question and transcript are required." },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `You are a helpful meeting assistant. Use the provided meeting transcript to answer the user's question accurately. 
    
RULES:
1. Answer the question using ONLY the information from the provided transcript.
2. If the answer is not in the transcript, state that you cannot find the information.
3. Do not hallucinate or add outside knowledge.
4. Keep the answer concise and professional.

TRANSCRIPT:
${transcript}

USER QUESTION:
${question}

ASSISTANT ANSWER:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const answer = response.text();

    return NextResponse.json({
      success: true,
      answer: answer || "I couldn't generate an answer based on the transcript.",
    });
  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      { error: error.message || "An error occurred while processing your request." },
      { status: 500 }
    );
  }
}
