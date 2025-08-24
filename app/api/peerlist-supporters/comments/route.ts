import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    // Try to read the pre-generated testimonials JSON
    const testimonialsPath = path.join(
      process.cwd(),
      "data",
      "testimonials.json",
    );

    if (fs.existsSync(testimonialsPath)) {
      // Use pre-generated testimonials
      const fileContent = fs.readFileSync(testimonialsPath, "utf-8");
      const data = JSON.parse(fileContent);

      return NextResponse.json({
        testimonials: data.testimonials,
        source: "cached",
        generatedAt: data.generatedAt,
      });
    } else {
      // Fallback: Return empty array or default testimonials
      console.warn(
        "Testimonials JSON not found. Run 'npm run generate-testimonials' to generate.",
      );

      return NextResponse.json({
        testimonials: [],
        source: "fallback",
      });
    }
  } catch (error) {
    console.error("Error in comments route:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
}
