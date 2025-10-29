import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";
import { apiResponse } from "../../../../utils/apiResponse";

export async function GET(req: Request) {
  const cookieHeader = req.headers.get("cookie");
  const token = cookieHeader?.split("token=")[1]?.split(";")[0];

  if (!token)
    return apiResponse({
      success: true,
      message: "User not authenticated",
      data: { user: null },
    });

  interface MyJwtPayload {
    id: string;
    email: string;
    iat: number;
    exp: number;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as MyJwtPayload;
    
    // Fetch user from database to get complete info including role
    await connectDB();
    const user = await User.findById(decoded.id).select("-password");
    
    if (!user) {
      return apiResponse({
        success: true,
        message: "User not found",
        data: { user: null },
      });
    }

    return apiResponse({
      success: true,
      message: "User authenticated",
      data: { 
        user: { 
          id: user._id, 
          email: user.email, 
          username: user.username,
          role: user.role || "author"
        } 
      },
    });
  } catch {
    return apiResponse({
      success: true,
      message: "Invalid token",
      data: { user: null },
    });
  }
}
