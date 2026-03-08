import { tool } from "ai";
import { createDoubao } from "doubao-ai-provider";
import { z } from "zod";
import { runSqlAction } from "@/app/actions/dataSource";
import logger from "@/lib/logger";

// Initialize the Doubao AI provider
const doubao = createDoubao({
  apiKey: process.env.DOUBAO_API_KEY,
});

// Default model ID from environment variables
const MODEL_ID = process.env.DOUBAO_MODEL_ID || "doubao-seed-2-0-mini-260215";

const createTools = (
  dbType: string,
  connectionInfo: Record<string, string>,
) => ({
  runSql: tool({
    description: "执行 SQL 查询以获取数据",
    inputSchema: z.object({
      sql: z.string().describe("要执行的查询 SQL 语句，不能是 DML 语句"),
    }),
    execute: async ({ sql }) => {
      logger.info(
        { sql, connectionInfo, dbType },
        "Executing SQL query via tool",
      );
      try {
        const result = await runSqlAction(dbType, connectionInfo, sql);
        logger.debug({ sql, success: result.success }, "SQL query executed");
        return result;
      } catch (error) {
        logger.error({ error, sql }, "Failed to execute SQL query");
        return { success: false, error: "查询执行失败" };
      }
    },
  }),
  generateView: tool({
    description: "生成数据可视化视图配置",
    inputSchema: z.object({
      title: z.string().describe("视图标题"),
      type: z
        .string()
        .describe("图表类型，如 bar, line, pie, area, scatter, table 等"),
      description: z.string().optional().describe("视图的简短描述"),
      query_sql: z.string().describe("用于获取图表数据的 SQL 查询语句"),
      viz_config: z
        .string()
        .describe("Vega-Lite 的 JSON 配置字符串，data 设为 { values: [] }"),
      layout_w: z
        .number()
        .optional()
        .default(1)
        .describe("视图在网格中的宽度占位 (1-4)"),
      layout_h: z
        .number()
        .optional()
        .default(1)
        .describe("视图在网格中的高度占位 (1-4)"),
    }),
    execute: async (viewData) => {
      logger.info(
        { title: viewData.title, type: viewData.type },
        "Generating view configuration",
      );
      // 这里可以进行简单的校验或直接返回，由前端处理保存逻辑
      return {
        success: true,
        message: "视图配置已生成",
        data: viewData,
      };
    },
  }),
});

export { doubao, createTools, MODEL_ID };
