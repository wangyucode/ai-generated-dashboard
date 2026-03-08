/** biome-ignore-all lint/suspicious/noExplicitAny: global has no type */
import fs from "node:fs";
import path from "node:path";
import knex, { type Knex } from "knex";
import logger from "@/lib/logger";

/**
 * Knex 实例用于操作应用自身的元数据库 meta.db
 * 该数据库用于存储仪表盘配置、AI 分析结果等
 */

export const dataPath = path.join(process.cwd(), "data");
if (!fs.existsSync(dataPath)) {
  logger.info({ dataPath }, "Creating data directory");
  fs.mkdirSync(dataPath, { recursive: true });
}

/**
 * 获取元数据库实例 (Singleton)
 * 该数据库用于存储仪表盘配置、AI 分析结果等
 */
export function getMetaDbInstance(): Knex {
  if (!(global as any).metaDb) {
    logger.debug("Creating new meta DB instance");
    (global as any).metaDb = knex({
      client: "better-sqlite3",
      connection: {
        filename: path.join(dataPath, "meta.db"),
      },
      useNullAsDefault: true,
    });
  }
  return (global as any).metaDb;
}

/**
 * 获取特定数据源的数据库实例
 * @param filename SQLite 数据库文件名
 */
export function getDatasourceDbInstance(
  connectionInfo: Record<string, string>,
  dbType: string,
): Knex {
  logger.debug(
    { filename: connectionInfo.file, dbType },
    "Creating new datasource DB instance",
  );
  return knex({
    client: "better-sqlite3",
    connection: {
      filename: path.join(dataPath, "db", connectionInfo.file),
    },
    useNullAsDefault: true,
  });
}

/**
 * 初始化数据库表结构
 */
export async function initDatabase() {
  try {
    const db = getMetaDbInstance();
    // 创建 data_sources 表
    const hasDataSources = await db.schema.hasTable("data_sources");
    if (!hasDataSources) {
      logger.info("Creating data_sources table");
      await db.schema.createTable("data_sources", (table) => {
        table.increments("id").primary();
        table.string("type").notNullable(); // sqlite, mysql, etc.
        table.text("connection_info").notNullable(); // JSON string
        table.string("name").notNullable(); // 数据源别名
        table.string("database").notNullable(); // 数据库名称/路径
        table.integer("table_count").defaultTo(0);
        table.timestamp("created_at").defaultTo(db.fn.now());
      });
    }

    // 创建 views 表
    const hasViews = await db.schema.hasTable("views");
    if (!hasViews) {
      logger.info("Creating views table");
      await db.schema.createTable("views", (table) => {
        table.increments("id").primary();
        table.integer("data_source_id").unsigned().notNullable();
        table.string("title").notNullable();
        table.string("type").notNullable().defaultTo("table"); // table or chart.
        table.text("description");
        table.text("query_sql").notNullable();
        table.integer("layout_w").defaultTo(1);
        table.integer("layout_h").defaultTo(1);
        table.integer("layout_order").defaultTo(0);
        table.text("viz_config").notNullable(); // JSON string
        table.timestamp("created_at").defaultTo(db.fn.now());

        table
          .foreign("data_source_id")
          .references("data_sources.id")
          .onDelete("CASCADE");
      });
    }
  } catch (error) {
    logger.error({ error }, "Failed to initialize database");
    throw error;
  }
}
