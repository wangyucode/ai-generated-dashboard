import fs from "node:fs/promises";
import path from "node:path";
import type { DuckDBMaterializedResult } from "@duckdb/node-api";
import { NextResponse } from "next/server";
import { getDB } from "@/lib/db";

async function fetchAllRows(result: DuckDBMaterializedResult) {
  const rows = [];
  for (let i = 0; i < result.chunkCount; i++) {
    const chunk = await result.getChunk(i);
    rows.push(...chunk.getRows());
  }
  return rows;
}

export async function GET() {
  // Ensure database is initialized
  const db = await getDB();

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

    const conn = await db.connect();

    // Ensure all found files exist in log_files table
    for (const f of fileStats) {
      if (f?.isFile) {
        // Check if exists, if not, insert with UNINITIALIZED
        const checkResult = await conn.run(
          "SELECT status FROM log_files WHERE file_path = ?",
          [f.name],
        );
        const rows = await fetchAllRows(checkResult);
        if (rows.length === 0) {
          await conn.run(
            "INSERT INTO log_files (file_path, status) VALUES (?, 'UNINITIALIZED')",
            [f.name],
          );
        }
      }
    }

    // Now fetch statuses for all files
    const allFilesResult = await conn.run(
      "SELECT file_path, status FROM log_files",
    );
    const allFileRows = await fetchAllRows(allFilesResult);
    const statusMap = new Map(
      allFileRows.map((r) => [r[0] as string, r[1] as string]),
    );

    const logFiles = fileStats
      .filter((f): f is NonNullable<typeof f> => f?.isFile === true)
      .map((f) => {
        const filePath = path.join(logsDir, f.name);
        return {
          name: f.name,
          size: f.size,
          mtime: f.mtime,
          status: statusMap.get(filePath) || "UNINITIALIZED",
        };
      });

    return NextResponse.json({ files: logFiles });
  } catch (error) {
    console.error("Error scanning logs directory:", error);
    return NextResponse.json(
      { error: "Failed to scan logs directory" },
      { status: 500 },
    );
  }
}
