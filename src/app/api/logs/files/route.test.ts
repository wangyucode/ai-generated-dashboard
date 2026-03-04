import fs from "node:fs/promises";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "./route";

vi.mock("fs/promises", () => ({
  default: {
    access: vi.fn(),
    readdir: vi.fn(),
    stat: vi.fn(),
  },
}));

describe("GET /api/logs/scan", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should return a list of files when logs directory exists", async () => {
    vi.mocked(fs.access).mockResolvedValue(undefined);
    vi.mocked(fs.readdir).mockResolvedValue(["access.log", "error.log"] as any);

    vi.mocked(fs.stat).mockImplementation(async (filePath: any) => {
      if (filePath.includes("access.log")) {
        return {
          isFile: () => true,
          size: 1024,
          mtime: new Date("2023-01-01"),
        } as any;
      }
      if (filePath.includes("error.log")) {
        return {
          isFile: () => true,
          size: 2048,
          mtime: new Date("2023-01-02"),
        } as any;
      }
      return { isFile: () => false } as any;
    });

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.files).toHaveLength(2);
    expect(data.files[0]).toEqual({
      name: "access.log",
      size: 1024,
      mtime: expect.any(String),
    });
  });

  it("should return empty list if logs directory does not exist", async () => {
    vi.mocked(fs.access).mockRejectedValue(new Error("ENOENT"));

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ files: [] });
  });
});
