"use server";

import { getMetaDb } from "@/lib/db";
import logger from "@/lib/logger";

/**
 * 获取指定数据源的所有视图
 */
export async function getViews(dataSourceId: number) {
  try {
    const db = await getMetaDb();
    const views = await db("views")
      .where("data_source_id", dataSourceId)
      .orderBy("layout_order", "asc")
      .orderBy("created_at", "desc");

    logger.debug("Views fetched successfully", {
      dataSourceId,
      count: views.length,
    });
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
 * 删除视图
 */
export async function deleteView(id: number) {
  try {
    logger.info("Deleting view", { id });
    const db = await getMetaDb();
    await db("views").where("id", id).del();

    logger.info({ id }, "View deleted successfully");
    return {
      success: true,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "删除视图失败";
    logger.error({ error, id }, "Failed to delete view");
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * 更新视图
 */
export async function updateView(
  id: number,
  viewData: {
    title: string;
    description?: string;
    query_sql: string;
    viz_config: string;
    layout_w: number;
    layout_h: number;
    layout_order: number;
  },
) {
  try {
    logger.info("Updating view", { id, title: viewData.title });
    const db = await getMetaDb();
    await db("views").where("id", id).update(viewData);

    logger.info({ id, title: viewData.title }, "View updated successfully");
    return {
      success: true,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "更新视图失败";
    logger.error({ error, id, viewData }, "Failed to update view");
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
  description?: string;
  query_sql: string;
  viz_config: string;
  layout_w?: number;
  layout_h?: number;
  layout_order?: number;
}) {
  try {
    logger.info("Saving new view", {
      title: viewData.title,
      dataSourceId: viewData.data_source_id,
    });
    const db = await getMetaDb();
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
