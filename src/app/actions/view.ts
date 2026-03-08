"use server";

import { getMetaDbInstance } from "@/lib/db";
import logger from "@/lib/logger";

/**
 * 获取指定数据源的所有视图
 */
export async function getViews(dataSourceId: number) {
  try {
    const db = getMetaDbInstance();
    const views = await db("views")
      .where("data_source_id", dataSourceId)
      .orderBy("created_at", "desc");

    logger.debug(
      { dataSourceId, count: views.length },
      "Views fetched successfully",
    );
    return {
      success: true,
      data: views,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "获取视图失败";
    logger.error({ error, dataSourceId }, "Failed to get views");
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * 保存视图
 */
export async function saveView(viewData: {
  data_source_id: number;
  title: string;
  type: string;
  description?: string;
  query_sql: string;
  viz_config: string;
  layout_w?: number;
  layout_h?: number;
}) {
  try {
    logger.info(
      { title: viewData.title, dataSourceId: viewData.data_source_id },
      "Saving new view",
    );
    const db = getMetaDbInstance();
    const [id] = await db("views").insert(viewData);

    logger.info({ id, title: viewData.title }, "View saved successfully");
    return {
      success: true,
      data: { id, ...viewData },
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "保存视图失败";
    logger.error({ error, viewData }, "Failed to save view");
    return {
      success: false,
      error: message,
    };
  }
}
