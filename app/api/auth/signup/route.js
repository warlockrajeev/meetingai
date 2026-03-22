import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { signToken } from "@/lib/auth";

export async function POST(req) {
  try {
    await connectDB();
    const { name, email, password } = await req.json();
    console.log("Signup attempt:", { name, email, password: password ? "***" : "missing" });

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Please provide all required fields" },
        { status: 400 }
      );
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return NextResponse.json(
        { error: "User already exists with this email" },
        { status: 400 }
      );
    }

    const user = await User.create({
      name,
      email,
      password,
    });

    const token = signToken(user._id);

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Signup error details:", error);
    return NextResponse.json(
      { error: `Registration failed: ${error.message}` },
      { status: 500 }
    );
  }
}
