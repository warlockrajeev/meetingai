import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(req) {
  try {
    await connectDB();
    const decoded = await getUserFromRequest(req);

    if (!decoded) {
      return NextResponse.json(
        { error: "Not authorized. Please log in." },
        { status: 401 }
      );
    }

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Auth me error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
