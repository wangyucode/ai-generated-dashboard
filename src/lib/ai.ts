import { createAnthropic } from "@ai-sdk/anthropic";
import { createDeepSeek } from "@ai-sdk/deepseek";
import { createOpenAI } from "@ai-sdk/openai";
import { tool } from "ai";
import { createDoubao } from "doubao-ai-provider";
import { compile, type TopLevelSpec } from "vega-lite";
import { z } from "zod";
import { runSqlAction } from "@/app/actions/dataSource";
import logger from "@/lib/logger";

// Helper for Doubao specific reasoning effort
export function getAddBodyFetchFunction(extraBody: Record<string, unknown>) {
  return (url: RequestInfo | URL, options?: RequestInit) => {
    if (options?.body && Object.keys(extraBody).length > 0) {
      try {
        const body = JSON.parse(options.body.toString());
        Object.assign(body, extraBody);
        options.body = JSON.stringify(body);
        logger.info("sending request with body", body);
      } catch (error) {
        logger.error("设置额外body参数失败", error);
      }
    }
    return fetch(url, options);
  };
}

/**
 * AI Provider Factory
 */
export function getModel(provider?: string, modelId?: string) {
  const aiProvider = provider || process.env.AI_PROVIDER || "doubao";
  const aiModelId = modelId || process.env.MODEL_ID;

  logger.info("Initializing AI model", {
    provider: aiProvider,
    modelId: aiModelId,
  });

  switch (aiProvider) {
    case "openai": {
      const openai = createOpenAI({
        apiKey: process.env.API_KEY,
        baseURL: process.env.OPENAI_BASE_URL,
      });
      return openai(aiModelId || "gpt-4o");
    }

    case "anthropic": {
      const anthropic = createAnthropic({
        apiKey: process.env.API_KEY,
      });
      return anthropic(aiModelId || "claude-3-5-sonnet-20240620");
    }

    case "deepseek": {
      const deepseek = createDeepSeek({
        apiKey: process.env.API_KEY,
      });
      return deepseek(aiModelId || "deepseek-chat");
    }

    case "doubao":
    default: {
      const doubao = createDoubao({
        apiKey: process.env.API_KEY,
        fetch: getAddBodyFetchFunction({
          reasoning_effort: "low",
        }),
      });
      return doubao(aiModelId || "doubao-seed-2-0-mini-260215");
    }
  }
}

// Keep backward compatibility for existing code that might import doubao/MODEL_ID
export const doubao = createDoubao({
  apiKey: process.env.API_KEY,
  fetch: getAddBodyFetchFunction({
    reasoning_effort: "low",
  }),
});
export const MODEL_ID = process.env.MODEL_ID || "doubao-seed-2-0-mini-260215";

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
