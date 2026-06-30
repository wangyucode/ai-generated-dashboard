"use server";

import fs from "node:fs";
import path from "node:path";
import { dataPath, getDatasourceDbInstance, getMetaDb } from "@/lib/db";
import logger from "@/lib/logger";
import type { DataSource } from "@/types/database";

/**
 * 获取 data/db 目录下所有可用的 SQLite 数据库文件
 * 结构为: data/db/<dir>/<file>.db
 */
export async function listAvailableSqliteDbs() {
  try {
    const dbBaseDir = path.join(dataPath, "db");
    if (!fs.existsSync(dbBaseDir)) {
      return { success: true, data: [] };
    }

    const dirs = fs
      .readdirSync(dbBaseDir, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);

    const dbFiles: { name: string; file: string }[] = [];

    for (const dirName of dirs) {
      const dirPath = path.join(dbBaseDir, dirName);
      const files = fs
        .readdirSync(dirPath)
        .filter(
          (file) =>
            file.endsWith(".db") ||
            file.endsWith(".sqlite") ||
            file.endsWith(".sqlite3"),
        );

      for (const file of files) {
        dbFiles.push({
          name: dirName,
          file: file,
        });
      }
    }

    return { success: true, data: dbFiles };
  } catch (error) {
    logger.error({ error }, "Failed to list sqlite dbs");
    return { success: false, error: "获取数据库列表失败" };
  }
}

/**
 * 从 meta.db 查询第一个（或最新一个）数据源
 */
export async function getDataSource(): Promise<DataSource | null> {
  try {
    const db = await getMetaDb();
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
 */
export async function addDataSource(payload: {
  name: string;
  type: string;
  connectionInfo: Record<string, unknown>;
}) {
  try {
    logger.info("Adding new data source", {
      name: payload.name,
      type: payload.type,
    });

    // 1. 验证 SQLite 路径是否存在 (如果是 SQLite)
    if (payload.type === "sqlite") {
      // 这里的 name 是用户输入的数据源别名
      const dbDir = path.join(dataPath, "db", payload.name);
      const dbPath = path.join(dbDir, payload.connectionInfo.file as string);

      if (!fs.existsSync(dbPath)) {
        logger.error("SQLite database file does not exist", {
          path: dbPath,
        });
        throw new Error(
          `SQLite 数据库文件不存在: ${dbPath}。请确保文件已放置在 data/db/${payload.name}/ 目录下。`,
        );
      }
      // 将 name 注入 connectionInfo，以便 getDatasourceDbInstance 使用
      payload.connectionInfo.name = payload.name;
    }

    // 2. 使用 getDatasourceDbInstance 连接到数据库并获取表数量
    const targetDb = getDatasourceDbInstance(
      payload.connectionInfo,
      payload.type,
    );

    let tableCount = 0;
    if (payload.type === "sqlite") {
      const tables = await targetDb("sqlite_master")
        .where("type", "table")
        .whereNot("name", "like", "sqlite_%");
      tableCount = tables.length;
    } else if (payload.type === "mysql") {
      const [rows] = (await targetDb.raw("SHOW TABLES")) as [
        unknown[],
        unknown,
      ];
      tableCount = rows.length;
    } else if (payload.type === "postgresql") {
      const result = await targetDb.raw(
        "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'",
      );
      tableCount = result.rows.length;
    }

    logger.debug("Connected to database and counted tables", {
      type: payload.type,
      tableCount,
    });

    // 3. 将信息存入 meta.db 的 data_sources 表
    const db = await getMetaDb();
    const [id] = await db("data_sources").insert({
      type: payload.type,
      connection_info: JSON.stringify(payload.connectionInfo),
      name: payload.name,
      database:
        payload.type === "sqlite"
          ? payload.connectionInfo.file
          : payload.connectionInfo.database || payload.name,
      table_count: tableCount,
    });

    // 4. 返回保存成功的数据源信息
    const newDataSource = await db<DataSource>("data_sources")
      .where("id", id)
      .first();

    logger.info("Data source added successfully", { id, name: payload.name });
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
    const db = await getMetaDb();
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
    const db = await getMetaDb();
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
  connectionInfo: Record<string, unknown>,
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
    const db = await getMetaDb();
    await db("data_sources").where("id", id).delete();
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
