import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir, readFile, unlink, rmdir } from "fs/promises";
import { createWriteStream } from "fs";
import { join } from "path";
import { existsSync } from "fs";

export async function POST(req: NextRequest) {
  console.log("API route hit!");
  try {
    const formData = await req.formData();
    const chunk = formData.get("chunk") as Blob;
    const chunkIndex = parseInt(formData.get("chunkIndex") as string);
    const totalChunks = parseInt(formData.get("totalChunks") as string);
    const filename = formData.get("filename") as string;

    console.log("Received form data:", {
      hasChunk: !!chunk,
      chunkIndex: chunkIndex,
      totalChunks: totalChunks,
      filename: filename
    });

    if (!chunk) {
      console.error("No chunk provided");
      return NextResponse.json(
        { error: "No chunk provided" },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadDir = join(process.cwd(), "uploads", "public");
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Create a temporary directory for chunks if it doesn't exist
    const tempDir = join(uploadDir, "temp");
    if (!existsSync(tempDir)) {
      await mkdir(tempDir, { recursive: true });
    }

    // Save the chunk
    const chunkPath = join(tempDir, `${filename}.part${chunkIndex}`);
    const chunkBuffer = Buffer.from(await chunk.arrayBuffer());
    await writeFile(chunkPath, chunkBuffer);

    // If this is the last chunk, combine all chunks
    if (chunkIndex === totalChunks - 1) {
      const finalPath = join(uploadDir, filename);
      const writeStream = createWriteStream(finalPath);

      // Combine all chunks
      for (let i = 0; i < totalChunks; i++) {
        const chunkPath = join(tempDir, `${filename}.part${i}`);
        const chunkBuffer = await readFile(chunkPath);
        writeStream.write(chunkBuffer);
      }

      writeStream.end();

      // Clean up temporary chunks
      for (let i = 0; i < totalChunks; i++) {
        const chunkPath = join(tempDir, `${filename}.part${i}`);
        await unlink(chunkPath);
      }

      // Remove temp directory if empty
      await rmdir(tempDir);

      return NextResponse.json({
        success: true,
        filePath: `/uploads/public/${filename}`
      });
    }

    // Return success for intermediate chunks
    return NextResponse.json({
      success: true,
      message: `Chunk ${chunkIndex + 1}/${totalChunks} uploaded successfully`
    });
  } catch (error) {
    console.error("Error uploading chunk:", error);
    return NextResponse.json(
      { error: "Error uploading chunk" },
      { status: 500 }
    );
  }
}