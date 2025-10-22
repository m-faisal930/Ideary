import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { message: "Gemini API key is not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { prompt } = body;

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return NextResponse.json(
        { message: "Prompt is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    const structuredPrompt = `
You are a professional blog writer. Based on the following user request, generate a complete blog post in JSON format.

User Request: ${prompt}

Return ONLY a valid JSON object with the following structure (no markdown, no code blocks, just pure JSON):
{
  "title": "An engaging and SEO-friendly blog title (max 200 characters)",
  "description": "A compelling excerpt or summary (max 300 characters)",
  "content": "The full blog post content in HTML format with proper headings (h2, h3), paragraphs (p), lists (ul/ol), and emphasis (strong, em) tags. Make it comprehensive and well-structured.",
  "tags": ["array", "of", "relevant", "tags", "max 10"]
}

Important:
- Make the content rich, engaging, and well-formatted with HTML tags
- Use proper HTML structure: <h2> for main sections, <h3> for subsections, <p> for paragraphs
- Include relevant examples, insights, and actionable information
- Keep the title concise but compelling
- Generate 5-10 relevant tags as lowercase strings
- Ensure all JSON is properly escaped and valid
`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent(structuredPrompt);
    const response = result.response;
    const text = response.text();

    let generatedData;
    try {
      const cleanedText = text
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();

      generatedData = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error("Failed to parse AI response:", text);
      return NextResponse.json(
        {
          message: "Failed to parse AI response. Please try again.",
          details:
            parseError instanceof Error ? parseError.message : "Unknown error",
        },
        { status: 500 }
      );
    }

    if (
      !generatedData.title ||
      !generatedData.content ||
      !Array.isArray(generatedData.tags)
    ) {
      return NextResponse.json(
        { message: "Invalid response structure from AI" },
        { status: 500 }
      );
    }

    const blogData = {
      title: String(generatedData.title).slice(0, 200),
      description: generatedData.description
        ? String(generatedData.description).slice(0, 300)
        : String(generatedData.title).slice(0, 300),
      content: String(generatedData.content),
      tags: generatedData.tags
        .slice(0, 10)
        .map((tag: string) => String(tag).toLowerCase().trim())
        .filter((tag: string) => tag.length > 0),
    };

    return NextResponse.json(blogData);
  } catch (error) {
    console.error("Error generating blog with Gemini:", error);

    if (error instanceof Error) {
      if (error.message.includes("API key")) {
        return NextResponse.json(
          { message: "Invalid API key configuration" },
          { status: 500 }
        );
      }
      if (
        error.message.includes("quota") ||
        error.message.includes("rate limit")
      ) {
        return NextResponse.json(
          { message: "API quota exceeded. Please try again later." },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      {
        message:
          "An error occurred while generating the blog. Please try again.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
