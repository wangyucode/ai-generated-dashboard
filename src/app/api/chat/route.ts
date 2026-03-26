import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { getAIConfig } from "@/app/actions/aiConfig";
import { createTools, getModel } from "@/lib/ai";
import logger from "@/lib/logger";

// Max duration for the API route
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const {
      messages,
      selectedTables,
      connection_info,
      dbType,
    }: {
      messages: UIMessage[];
      selectedTables: string[];
      connection_info: string;
      dbType: string;
    } = await req.json();

    logger.info("Chat request received", {
      tableCount: selectedTables?.length,
      dbType,
    });

    const systemMessage =
      "你是一个专业的数据分析专家和可视化专家。你的目标是协助用户分析数据库中的数据，并生成精美、直观、可交互的可视化图表。\n" +
      `当前数据库类型：${dbType}\n` +
      `当前选择的数据表：${selectedTables.join(",")}\n` +
      "### 工作流程：\n" +
      "1. **理解需求**：仔细阅读用户的问题，结合当前的数据表结构进行思考。\n" +
      "2. **探索数据**：如果需要，使用 `runSql` 工具查询数据以验证你的想法 or 查看数据分布. 请注意 SQL 只能执行 SELECT 查询，且应包含 LIMIT 以节约token和资源。\n" +
      "3. **生成视图**：使用 `generateView` 工具生成最终的视图配置。你需要提供标题、描述、SQL 查询、布局建议以及 Vega-Lite 配置。\n" +
      "4. **确认视图**：用户确认生成的视图是否符合预期。如果需要调整或执行工具报错，重复以上步骤直到正确渲染并且用户满意。\n" +
      "\n" +
      "### 关于 Vega-Lite 配置 (viz_config):\n" +
      "- 使用 standard Vega-Lite JSON 格式。\n" +
      '- `data` 属性应设为 `{"values": []}`，系统会自动将 SQL 查询结果填充到其中。\n' +
      "- 确保字段名称与你的 `query_sql` 返回的列名完全一致，以确保数据绑定正确。\n" +
      "\n" +
      "### 约束条件：\n" +
      `- 只能执行符合 ${dbType} 的语法规范的查询语句，不能执行 DML 语句 (INSERT, UPDATE, DELETE)。\n` +
      "- 一次仅返回一个可视化视图。\n";

    const connectionInfo = JSON.parse(connection_info);
    const tools = createTools(dbType, connectionInfo);

    const aiConfig = await getAIConfig(false);
    if (!aiConfig) {
      logger.error("AI configuration not found in database");
      return new Response(
        "AI configuration not found. Please configure your API key in settings.",
        { status: 400 },
      );
    }

    const model = getModel(
      aiConfig.base_url,
      aiConfig.model_id,
      aiConfig.api_key,
    );

    if (!model) {
      logger.error(
        "AI model initialization failed - check API key in database",
      );
      return new Response(
        "AI model initialization failed. Please check your API key configuration in settings.",
        { status: 500 },
      );
    }

    const result = streamText({
      model,
      system: systemMessage,
      messages: await convertToModelMessages(messages),
      tools,
      stopWhen: ({ steps }) => {
        if (!steps?.length) return false;
        const lastStep = steps[steps.length - 1];
        if (!lastStep?.content?.length) return false;
        const lastContent = lastStep.content[lastStep.content.length - 1];
        if (
          lastContent.type === "tool-result" &&
          lastContent.toolName === "generateView" &&
          (lastContent.output as { success: boolean }).success
        )
          return true;
        return steps.length >= 5;
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    logger.error({ error }, "Error in chat API route");
    return new Response("Internal Server Error", { status: 500 });
  }
}
