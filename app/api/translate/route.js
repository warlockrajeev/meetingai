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

    const { text, language } = await request.json();

    if (!text || !language) {
      return NextResponse.json(
        { error: "Text and language are required for translation." },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `Translate the following meeting-related text into ${language}. 
    Maintain the professional tone and formatting. Only output the translated text.

TEXT TO TRANSLATE:
${text}

TRANSLATED TEXT:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const translatedText = response.text();

    return NextResponse.json({
      success: true,
      translatedText: translatedText.trim(),
    });
  } catch (error) {
    console.error("Translation API Error:", error);
    return NextResponse.json(
      { error: error.message || "An error occurred during translation." },
      { status: 500 }
    );
  }
}
