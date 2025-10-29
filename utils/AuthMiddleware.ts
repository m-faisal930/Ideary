import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/mongoose";
import User from "@/models/User";
import { apiResponse } from "./apiResponse";

export interface AuthenticatedUser {
  id: string;
  email: string;
  username: string;
}

export interface AuthenticatedRequest extends NextRequest {
  user?: AuthenticatedUser;
}

export async function extractUserFromToken(
  req: NextRequest
): Promise<{ user: AuthenticatedUser | null; error: any }> {
  try {
    const cookieHeader = req.headers.get("cookie");
    const token = cookieHeader?.split("token=")[1]?.split(";")[0];

    if (!token) {
      return { user: null, error: apiResponse({ success: false, message: "Access token required", status: 401 }) };
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!);
    } catch (jwtError) {
      return { user: null, error: apiResponse({ success: false, message: "Invalid or expired token", status: 401 }) };
    }

    await connectDB();
    const user = await User.findById(decoded.id).select("-password");
    
    if (!user) {
      return { user: null, error: apiResponse({ success: false, message: "User not found", status: 404 }) };
    }

    return {
      user: {
        id: user._id.toString(),
        email: user.email,
        username: user.username,
      },
      error: null,
    };
  } catch (error) {
    console.error("Authentication error", error);
    return { user: null, error: apiResponse({ success: false, message: "Authentication error", status: 500 }) };
  }
}


export async function authenticateUser(req: NextRequest) {
  const { user, error } = await extractUserFromToken(req);
  
  if (error) {
    return { user: null, error };
  }

  return { user, error: null };
}

export async function authorizeResourceOwner(
  req: NextRequest,
  resourceUserId: string
): Promise<{ authorized: boolean; error: any }> {
  const { user, error } = await authenticateUser(req);

  if (error) {
    return { authorized: false, error };
  }

  if (!user) {
    return { authorized: false, error: apiResponse({ success: false, message: "Authentication required", status: 401 }) };
  }

  if (user.id !== resourceUserId) {
    return { authorized: false, error: apiResponse({ success: false, message: "Access denied: You can only access your own resources", status: 401 }) };
  }

  return { authorized: true, error: null };
}

export async function getUserFromRequest(req: NextRequest): Promise<{ 
  user: AuthenticatedUser | null; 
  error: any 
}> {
  return await extractUserFromToken(req);
}