import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { apiResponse } from "../../../../utils/apiResponse";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return apiResponse({ success: false, message: "Email and password required", status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return apiResponse({ success: false, message: "Invalid email format", status: 400 });
    }

    if (password.length < 6) {
      return apiResponse({ success: false, message: "Password must be at least 6 characters long", status: 400 });
    }

    await connectDB();

    const user = await User.findOne({ email });
    if (!user) {
      return apiResponse({ success: false, message: "Invalid credentials", status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return apiResponse({ success: false, message: "Invalid credentials", status: 401 });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email},
      process.env.JWT_SECRET!,
      {
        expiresIn: "24h",
      }
    );

    const userData = { 
      id: user._id, 
      email: user.email, 
      username: user.username,
      role: user.role || "author"
    };

  const response = apiResponse({ success: true, message: "Login successful", data: { user: userData } });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("Login failed", err);
    return apiResponse({ success: false, message: "Login failed", status: 500 });
  }
}
