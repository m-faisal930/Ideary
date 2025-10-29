import bcrypt from "bcrypt";
import User from "@/models/User";
import { connectDB } from "@/lib/mongoose";
import { verifyToken } from "../../../../utils/verifyToken";
import { apiResponse } from "../../../../utils/apiResponse";
import { validatePassword } from "@/utils/validatePassword";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { token, password } = await req.json();

    if (!password || password.length < 6) {
      return apiResponse({ success: false, message: "Password must be at least 6 characters long", status: 400 });
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return apiResponse({ success: false, message: passwordError, status: 400 });
    }

    const { payload, tokenError, status } = verifyToken(token);

    if (tokenError) {
      return apiResponse({ success: false, message: tokenError, status: status || 401 });
    }

    if (!payload) {
      return apiResponse({ success: false, message: "Token verification failed", status: 401 });
    }

    const user = await User.findById(payload.id);
    if (!user) {
      return apiResponse({ success: false, message: "User not found", status: 404 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    return apiResponse({ success: true, message: "Password reset successful" });
  } catch (err) {
    console.error("Failed to reset password", err);
    return apiResponse({ success: false, message: "Failed to reset password", status: 500 });
  }
}
