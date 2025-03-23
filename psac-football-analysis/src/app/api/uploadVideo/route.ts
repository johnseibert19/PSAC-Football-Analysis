import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import fs from "fs";

export async function POST(req: NextRequest) {
  console.log("API route hit!");
  try {
    const formData = await req.formData();
    const file = formData.get("video") as File;
    const filename = formData.get("filename") as string;

    console.log("Received form data:", {
      hasVideo: !!file,
      videoType: file?.type
    });

    if (!file) {
      console.error("Missing video file");
      return NextResponse.json(
        { error: "Video file is required." },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Save the file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);

    // Return the local file path instead of a URL
    return NextResponse.json({
      success: true,
      filePath: filename // Just return the filename, not a full URL
    });
  } catch (error) {
    console.error("Error uploading video:", error);
    return NextResponse.json(
      { error: "Failed to upload video: " + (error as Error).message },
      { status: 500 }
    );
  }
}