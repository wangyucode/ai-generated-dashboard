"use server";

import fs from "node:fs";
import path from "node:path";
import { revalidatePath } from "next/cache";
import {
  dataPath,
  getDatasourceDbInstance,
  getMetaDbInstance,
  initDatabase,
} from "@/lib/db";
import logger from "@/lib/logger";
import type { DataSource } from "@/types/database";

/**
 * 从 meta.db 查询第一个（或最新一个）数据源
 */
export async function getDataSource(): Promise<DataSource | null> {
  try {
    await initDatabase();
    const db = getMetaDbInstance();
    const dataSource = await db<DataSource>("data_sources")
      .orderBy("id", "desc")
      .first();
    return dataSource || null;
  } catch (error) {
    logger.error({ error }, "Failed to get data source");
    return null;
  }
}

/**
 * 添加新的数据源
 * @param payload 包含数据源名称和 SQLite 文件名
 */
export async function addDataSource(payload: { name: string; file: string }) {
  try {
    logger.info("Adding new data source", {
      name: payload.name,
      file: payload.file,
    });
    // 1. 验证 SQLite 路径是否存在
    if (!fs.existsSync(path.join(dataPath, "db", payload.file))) {
      logger.error("SQLite database file does not exist", {
        file: payload.file,
      });
      throw new Error(`SQLite 数据库文件不存在: ${payload.file}`);
    }

    // 2. 使用 getDatasourceDbInstance 连接到该 SQLite 数据库
    const targetDb = getDatasourceDbInstance({ file: payload.file }, "sqlite");

    const tables = await targetDb("sqlite_master")
      .where("type", "table")
      .whereNot("name", "like", "sqlite_%");
    const tableCount = tables.length;
    logger.debug("Connected to database and counted tables", {
      file: payload.file,
      tableCount,
    });

    // 3. 将信息存入 meta.db 的 data_sources 表
    const db = getMetaDbInstance();
    const [id] = await db("data_sources").insert({
      type: "sqlite",
      connection_info: JSON.stringify({ file: payload.file }),
      name: payload.name,
      database: payload.file,
      table_count: tableCount,
    });

    // 4. 返回保存成功的数据源信息
    const newDataSource = await db<DataSource>("data_sources")
      .where("id", id)
      .first();

    logger.info("Data source added successfully", { id, name: payload.name });
    revalidatePath("/");
    return {
      success: true,
      data: newDataSource,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "添加数据源失败";
    logger.error("Failed to add data source", { error, payload });
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * 获取数据源中的所有表名
 * @param id 数据源 ID
 */
export async function getTables(id: number) {
  try {
    const db = getMetaDbInstance();
    const dataSource = await db<DataSource>("data_sources")
      .where("id", id)
      .first();

    if (!dataSource) {
      throw new Error("数据源不存在");
    }

    const connectionInfo = JSON.parse(dataSource.connection_info);
    const targetDb = getDatasourceDbInstance(connectionInfo, dataSource.type);

    const tables = await targetDb("sqlite_master")
      .where("type", "table")
      .whereNot("name", "like", "sqlite_%")
      .select("name");
    return {
      success: true,
      data: tables.map((t) => t.name),
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "获取表列表失败";
    console.error("Failed to get tables:", error);
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * 获取指定表的 Schema (列名、类型)
 * @param dataSourceId 数据源 ID
 * @param tableNames 表名列表
 */
export async function getTableSchemas(
  dataSourceId: number,
  tableNames: string[],
) {
  try {
    const db = getMetaDbInstance();
    const dataSource = await db<DataSource>("data_sources")
      .where("id", dataSourceId)
      .first();

    if (!dataSource) {
      throw new Error("数据源不存在");
    }

    const connectionInfo = JSON.parse(dataSource.connection_info);
    const targetDb = getDatasourceDbInstance(connectionInfo, dataSource.type);

    // biome-ignore lint/suspicious/noExplicitAny: columns from PRAGMA table_info
    const schemas: Record<string, any[]> = {};
    for (const tableName of tableNames) {
      const columns = await targetDb.raw(`PRAGMA table_info(${tableName})`);
      schemas[tableName] = columns;
    }
    return {
      success: true,
      data: schemas,
    };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "获取表 Schema 失败";
    console.error("Failed to get table schemas:", error);
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * 执行 SQL 语句并返回结果
 * @param dbType 数据库类型
 * @param connectionInfo 数据库连接信息
 * @param sql SQL 语句
 */
export async function runSqlAction(
  dbType: string,
  connectionInfo: unknown,
  sql: string,
) {
  try {
    const targetDb = getDatasourceDbInstance(connectionInfo, dbType);

    // 执行 SQL
    const result = await targetDb.raw(sql);
    return {
      success: true,
      data: result,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "SQL 执行失败";
    console.error("Failed to run SQL:", error, sql);
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * 删除数据源
 * @param id 数据源 ID
 */
export async function deleteDataSource(id: number) {
  try {
    const db = getMetaDbInstance();
    await db("data_sources").where("id", id).delete();
    revalidatePath("/");
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "删除数据源失败";
    console.error("Failed to delete data source:", error);
    return {
      success: false,
      error: message,
    };
  }
}
