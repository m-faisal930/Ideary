import jwt from "jsonwebtoken";import User from "@/models/User";
import { connectDB } from "@/lib/mongoose";
import { Resend } from "resend";
import { apiResponse } from "../../../../utils/apiResponse";

export async function POST(req: Request) {
  const resend = new Resend(process.env.RESEND_API_KEY!);
  try {
    await connectDB();
    const { email } = await req.json();

    const user = await User.findOne({ email });
    if (!user) {
      return apiResponse({ success: false, message: "User not found", status: 404 });
    }

    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, {
      expiresIn: "15m",
    });

    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;

    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: `${email}`,
      subject: "Reset your password",
      html: `<strong>Click here to reset your password</strong> ${resetLink}`,
    });

    return apiResponse({ success: true, message: "Reset link sent to your email" });
  } catch (err) {
    console.error("Failed to send reset email", err);
    return apiResponse({ success: false, message: "Failed to send reset email", status: 500 });
  }
}
