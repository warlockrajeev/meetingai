import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Meeting from "@/models/Meeting";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(req) {
  try {
    await connectDB();

    // Check authentication
    const decoded = await getUserFromRequest(req);
    if (!decoded) {
      return NextResponse.json(
        { error: "Not authorized. Please log in." },
        { status: 401 }
      );
    }

    const meetings = await Meeting.find({ userId: decoded.userId })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: meetings,
    });
  } catch (error) {
    console.error("Meetings API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch meetings." },
      { status: 500 }
    );
  }
}
