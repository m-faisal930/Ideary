import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";
import bcrypt from "bcrypt";
import { validatePassword } from "../../../../utils/validatePassword";
import { apiResponse } from "../../../../utils/apiResponse";

export async function POST(req: Request) {
  try {
    const { email, username, password } = await req.json();

    if (!email || !username || !password) {
      return apiResponse({ success: false, message: "All fields are required", status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return apiResponse({ success: false, message: "Invalid email format", status: 400 });
    }

    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(username)) {
      return apiResponse({ success: false, message: "Username must be 3-20 characters and contain only letters, numbers, or underscores", status: 400 });
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return apiResponse({ success: false, message: passwordError, status: 400 });
    }

    await connectDB();

    const existing = await User.findOne({ email });
    if (existing) {
      return apiResponse({ success: false, message: "Email already exists", status: 400 });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      username,
      password: hashed,
    });

    return apiResponse({ success: true, message: "User created successfully", data: { userId: user._id }, status: 201 });
  } catch (error) {
    console.error("Failed to create user", error);
    return apiResponse({ success: false, message: "Failed to create user", status: 500 });
  }
}
