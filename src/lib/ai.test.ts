import { describe, expect, it, vi } from "vitest";
import { createTools } from "./ai";

interface ExecuteResult {
  success: boolean;
  message?: string;
  error?: string;
  data?: unknown;
}

// Mock runSqlAction and logger
vi.mock("@/app/actions/dataSource", () => ({
  runSqlAction: vi.fn(),
}));

vi.mock("@/lib/logger", () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

describe("ai tools validation", () => {
  const tools = createTools("sqlite", {});

  describe("generateView validation", () => {
    it("should accept valid Vega-Lite config", async () => {
      const validConfig = JSON.stringify({
        mark: "bar",
        encoding: {
          x: { field: "a", type: "nominal" },
          y: { field: "b", type: "quantitative" },
        },
      });

      // @ts-expect-error - execute is private or complex typed in tool
      const result = (await tools.generateView.execute({
        title: "Test",
        query_sql: "SELECT * FROM test",
        viz_config: validConfig,
      })) as ExecuteResult;

      expect(result.success).toBe(true);
    });

    it("should reject invalid JSON", async () => {
      // @ts-expect-error - execute is private or complex typed in tool
      const result = (await tools.generateView.execute({
        title: "Test",
        query_sql: "SELECT * FROM test",
        viz_config: "{ invalid json }",
      })) as ExecuteResult;

      expect(result.success).toBe(false);
      expect(result.error).toContain("无效的 Vega-Lite 配置");
      console.log("invalid JSON error:", result.error);
    });

    it("should reject invalid Vega-Lite structure", async () => {
      const invalidConfig = JSON.stringify({
        invalid_property: "bar",
      });

      // @ts-expect-error - execute is private or complex typed in tool
      const result = (await tools.generateView.execute({
        title: "Test",
        query_sql: "SELECT * FROM test",
        viz_config: invalidConfig,
      })) as ExecuteResult;

      expect(result.success).toBe(false);
      expect(result.error).toContain("无效的 Vega-Lite 配置");
      console.log("invalid Vega-Lite structure error:", result.error);
    });
  });
});
