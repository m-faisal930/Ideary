import { apiResponse } from "../../../../utils/apiResponse";

export async function POST() {
  const response = apiResponse({ success: true, message: "Logged out successfully" });
  response.cookies.set("token", "", { maxAge: 0 });
  return response;
}
