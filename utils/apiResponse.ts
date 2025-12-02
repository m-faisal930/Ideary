import { NextResponse } from "next/server";

export interface ApiResponseStructure<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  errors?: string[];
}

export function apiResponse<T = any>({
  success,
  message,
  data,
  status = 200,
  errors,
}: {
  success: boolean;
  message: string;
  data?: T;
  status?: number;
  errors?: string[];
}): NextResponse<ApiResponseStructure<T>> {
  return NextResponse.json(
    {
      success,
      message,
      ...(success ? { data } : { error: message, errors }),
    },
    { status }
  );
}