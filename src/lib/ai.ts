import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { tool } from "ai";
import { compile, type TopLevelSpec } from "vega-lite";
import { z } from "zod";
import { runSqlAction } from "@/app/actions/dataSource";
import logger from "@/lib/logger";

export function getModel(baseURL?: string, modelId?: string, apiKey?: string) {
  if (!apiKey) {
    logger.warn("OpenRouter API key is not configured");
    return null;
  }

  const openrouter = createOpenRouter({
    apiKey,
    baseURL: baseURL || "https://openrouter.ai/api/v1",
  });

  const model = modelId || "openrouter/free";
  logger.info("Initializing OpenRouter model", { baseURL, modelId: model });
  return openrouter(model);
}

export const createTools = (dbType: string, connectionInfo: any) => ({
  runSql: tool({
    description: "执行 SQL 查询以获取数据",
    inputSchema: z.object({
      sql: z.string().describe("要执行的查询 SQL 语句，不能是 DML 语句"),
    }),
    execute: async ({ sql }) => {
      logger.info("Executing SQL query via tool", {
        sql,
        connectionInfo,
        dbType,
      });
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
      description: z.string().optional().describe("视图的简短描述"),
      query_sql: z.string().describe("用于获取图表数据的 SQL 查询语句"),
      viz_config: z
        .string()
        .describe("Vega-Lite 的 JSON 配置字符串，data 设为 { values: [] }"),
      layout_w: z
        .number()
        .optional()
        .default(1)
        .describe("视图在网格中的宽度占位 (1-6)"),
      layout_h: z
        .number()
        .optional()
        .default(1)
        .describe("视图在网格中的高度占位 (1-6)"),
      layout_order: z
        .number()
        .optional()
        .default(0)
        .describe("视图的排序权重，数字越小越靠前"),
    }),
    execute: async (viewData) => {
      logger.info("Generating view configuration", {
        title: viewData.title,
      });

      // 验证 Vega-Lite 配置是否合法
      try {
        const parsedConfig = JSON.parse(viewData.viz_config);
        // 如果是 Vega-Lite 格式，使用 compile 验证
        compile(parsedConfig as TopLevelSpec);
      } catch (error) {
        logger.error(
          { error, viz_config: viewData.viz_config },
          "Vega-Lite validation failed",
        );
        return {
          success: false,
          error: `无效的 Vega-Lite 配置: ${error instanceof Error ? error.message : String(error)}`,
        };
      }

      return {
        success: true,
        message: "视图配置已生成",
        data: viewData,
      };
    },
  }),
});
