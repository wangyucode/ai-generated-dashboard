"use server";

import fs from "node:fs";
import path from "node:path";
import knex from "knex";
import db, { dataPath, initDatabase } from "@/lib/db";
import type { DataSource } from "@/types/database";

/**
 * 从 meta.db 查询第一个（或最新一个）数据源
 */
export async function getDataSource(): Promise<DataSource | null> {
  try {
    await initDatabase();
    const dataSource = await db<DataSource>("data_sources")
      .orderBy("id", "desc")
      .first();
    return dataSource || null;
  } catch (error) {
    console.error("Failed to get data source:", error);
    return null;
  }
}

/**
 * 添加新的数据源
 * @param payload 包含数据源名称和 SQLite 文件名
 */
export async function addDataSource(payload: { name: string; file: string }) {
  try {
    await initDatabase();

    // 1. 验证 SQLite 路径是否存在
    if (!fs.existsSync(path.join(dataPath, "db", payload.file))) {
      throw new Error(`SQLite 数据库文件不存在: ${payload.file}`);
    }

    // 2. 使用 knex 连接到该 SQLite 数据库，扫描 sqlite_master 获取表数量
    const targetDb = knex({
      client: "better-sqlite3",
      connection: {
        filename: payload.file,
      },
      useNullAsDefault: true,
    });

    let tableCount = 0;
    try {
      const tables = await targetDb("sqlite_master").where("type", "table");
      tableCount = tables.length;
    } finally {
      await targetDb.destroy();
    }

    // 3. 将信息存入 meta.db 的 data_sources 表
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

    return {
      success: true,
      data: newDataSource,
    };
  } catch (error: any) {
    console.error("Failed to add data source:", error);
    return {
      success: false,
      error: error.message || "添加数据源失败",
    };
  }
}
