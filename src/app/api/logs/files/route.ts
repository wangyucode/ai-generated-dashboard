import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { getDB } from "@/lib/db";

export async function GET() {
  // Ensure database is initialized
  await getDB();

  const logsDir = path.join(process.cwd(), "logs");

  try {
    try {
      await fs.access(logsDir);
    } catch {
      return NextResponse.json({ files: [] });
    }

    const files = await fs.readdir(logsDir);

    const fileStats = await Promise.all(
      files.map(async (file) => {
        const filePath = path.join(logsDir, file);
        try {
          const stats = await fs.stat(filePath);
          return {
            name: file,
            isFile: stats.isFile(),
            size: stats.size,
            mtime: stats.mtime,
          };
        } catch (_e) {
          return null;
        }
      }),
    );

    const logFiles = fileStats
      .filter((f): f is NonNullable<typeof f> => f?.isFile === true)
      .map((f) => ({
        name: f.name,
        size: f.size,
        mtime: f.mtime,
      }));

    return NextResponse.json({ files: logFiles });
  } catch (error) {
    console.error("Error scanning logs directory:", error);
    return NextResponse.json(
      { error: "Failed to scan logs directory" },
      { status: 500 },
    );
  }
}
