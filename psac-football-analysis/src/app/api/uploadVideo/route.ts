import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  console.log("API route hit!");
  try {
    const formData = await req.formData();
    const video = formData.get("video") as Blob | null;
    const filename = formData.get("filename") as string | null;

    if (!video || !filename) {
      return NextResponse.json({ error: "Video and filename are required." }, { status: 400 });
    }

    const buffer = Buffer.from(await video.arrayBuffer());
    const filePath = path.join(process.cwd(), "public", filename); //Removed the leading "/"

    console.log("File Path:", filePath); //Added console log.

    await writeFile(filePath, buffer);

    const url = `/public/${filename}`;

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Error uploading video:", error);
    return NextResponse.json({ error: "Failed to upload video" }, { status: 500 });
  }
}