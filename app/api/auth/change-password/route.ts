import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";
import bcrypt from "bcrypt";
import { validatePassword } from "../../../../utils/validatePassword";
import { verifyToken } from "../../../../utils/verifyToken";
import { apiResponse } from "../../../../utils/apiResponse";

export async function PUT(req: Request) {
  try {
    const { oldPassword, newPassword } = await req.json();

    if (!oldPassword || !newPassword) {
      return apiResponse({ success: false, message: "Old and new passwords are required", status: 400 });
    }

    if (oldPassword.length < 6) {
      return apiResponse({ success: false, message: "Old password must be at least 6 characters long", status: 400 });
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      return apiResponse({ success: false, message: passwordError, status: 400 });
    }

    if (oldPassword === newPassword) {
      return apiResponse({ success: false, message: "New password cannot be the same as the old password", status: 400 });
    }

    const cookieHeader = req.headers.get("cookie");
    const token = cookieHeader?.split("token=")[1]?.split(";")[0];

    const { payload, tokenError, status } = verifyToken(token);

    if (tokenError) {
      return apiResponse({ success: false, message: tokenError, status: status || 401 });
    }

    if (!payload) {
      return apiResponse({ success: false, message: "Token verification failed", status: 401 });
    }

    await connectDB();

    const user = await User.findById(payload.id);
    if (!user) {
      return apiResponse({ success: false, message: "User not found", status: 404 });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return apiResponse({ success: false, message: "Old password is incorrect", status: 401 });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    const response = apiResponse({ success: true, message: "Password changed successfully" });
    response.cookies.set("token", "", { maxAge: 0 });
    return response;
  } catch (err) {
    console.error("Failed to change password", err);
    return apiResponse({ success: false, message: "Failed to change password", status: 500 });
  }
}
