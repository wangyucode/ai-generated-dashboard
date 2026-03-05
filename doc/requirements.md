# AI Log Analyzer 需求文档

## 1. 项目概述 (Project Overview)
本项目旨在开发一个基于 AI 的本地日志分析工具。用户只需将日志文件放入指定目录，系统即可通过 AI 自动分析日志结构、生成解析规则、导入数据库，并通过自然语言对话生成可视化的数据图表。

## 2. 核心功能 (Core Features)

### 2.1 日志文件管理 (Log Management)
*   **自动发现**: 应用启动时，自动扫描 `logs` 目录下的所有文件。
*   **导航栏**: 在顶部导航栏提供下拉菜单 (Dropdown Menu)，展示所有发现的日志文件供用户选择。
*   **状态标识**: 区分“已初始化”和“未初始化”的日志文件。

### 2.2 仪表盘与视图布局 (Dashboard & Layout)
*   **网格布局**: 内容区域采用网格系统 (Grid Layout) 展示视图。
*   **默认视图 (App Info)**:
    *   **Order**: -1 (始终置顶)。
    *   **内容**: 展示应用基本信息、当前日志文件状态。
    *   **操作**: 如果日志未初始化，显示“初始化”按钮；如果已初始化，显示基本统计信息（如记录数、时间范围等）。
*   **自定义视图**: 展示用户通过 AI 生成的各种数据可视化图表。

### 2.3 智能化初始化流程 (AI Initialization) - [已推迟 / Deferred]
> **注意**: 为快速达成 MVP (Minimum Viable Product)，暂不实现全自动 AI 初始化。初期版本将专注于 **2.3.1 简化初始化流程**。

(原计划内容保留供后续参考)
用户点击“初始化”后，执行以下自动化流程：
1.  **读取采样**: 读取日志文件的前 N 行（例如 100 行）作为样本。
2.  **AI 分析**: 调用 AI 模型分析日志结构，识别字段（Field Name, Type）。
3.  **生成解析器**: AI 生成正则表达式或解析代码。
4.  **数据库建表**: AI 生成 `CREATE TABLE` SQL 语句。
5.  **数据导入**: AI 生成 `INSERT` SQL 模板或脚本。
6.  **持久化配置**: 将解析器代码、`CREATE SQL`、`INSERT SQL` 存入 `log_files` 元数据表。
7.  **执行导入**: 运行生成的 SQL，解析并插入全量日志数据。
8.  **定时任务**: 启动后台任务，定期检查文件更新并解析新增日志。

### 2.3.1 简化初始化流程 (Simplified Initialization - MVP)
针对 MVP 阶段，我们将采用硬编码方式处理特定格式的日志，优先支持 **Caddy JSON Access Log**。

1.  **特定格式识别**: 系统预置 Caddy JSON 日志的解析逻辑和数据库表结构。
2.  **直接解析**: 跳过 AI 分析步骤，直接使用内置解析器读取日志文件。
3.  **建表与导入**: 使用预定义的 SQL 语句创建表并导入数据。
4.  **快速可用**: 用户选择日志文件后，若符合格式，直接完成初始化，立即进入视图生成阶段。


### 2.4 交互式视图生成 (Interactive View Generation)
*   **入口**: 在所有视图的最后显示一个“+”号卡片。
*   **AI 聊天界面**: 点击“+”号弹出对话框，提供两种模式：
    *   **自然语言生成**: 用户输入提示词（如“统计每小时的错误数量”）。
    *   **智能建议**: 点击“分析现有日志”按钮，AI 自动推荐有价值的可视化方向。
*   **生成过程**:
    1.  AI 根据提示词和表结构，生成 `SELECT` 查询 SQL。
    2.  生成视图配置：
        *   **View Name**: 视图名称。
        *   **View Description**: 简介。
        *   **View Type**: 图表类型 (Line, Bar, Pie, Table, Metric, etc.)。
        *   **Layout Config**: 宽高 (w, h)，例如 1x1, 2x4。
        *   **Order**: 排序权重 (>0)。
    3.  **预览**: 前端尝试运行 SQL 并渲染预览图表。

### 2.5 视图管理与保存 (View Management)
*   **编辑与反馈**: 用户可以在预览阶段修改 Title, Description, Layout 配置。
*   **重新生成**: 如果结果不满意，可要求 AI 重新生成或调整 SQL。
*   **保存**: 用户点击“保存”后，将视图配置和 SQL 存入 `views` 表，并立即渲染在仪表盘中。

## 3. 数据模型设计建议 (Database Schema)

建议使用 **SQLite** 或 **DuckDB** 作为本地数据库，轻量且易于部署。

### 3.1 `log_files` (日志文件元数据表)
| 字段 | 类型 | 描述 |
| :--- | :--- | :--- |
| id | INTEGER PK | 自增 ID |
| file_path | TEXT | 日志文件路径 |
| table_name | TEXT | 对应的解析后数据表名 |
| parser_script | TEXT | 解析器脚本/正则 |
| last_read_offset | INTEGER | 上次读取的文件字节偏移量 |
| create_sql | TEXT | 建表 SQL |
| insert_sql | TEXT | 插入 SQL |
| retention_days | INTEGER | 日志解析结果保留天数 |
| status | TEXT | UNINITIALIZED, PARSING, READY, ERROR |
| created_at | DATETIME | 创建时间 |

### 3.2 `views` (视图配置表)
| 字段 | 类型 | 描述 |
| :--- | :--- | :--- |
| id | INTEGER PK | 自增 ID |
| log_file_id | INTEGER | 关联的日志文件 ID |
| title | TEXT | 视图标题 |
| description | TEXT | 视图描述 |
| query_sql | TEXT | 查询数据的 SQL |
| chart_type | TEXT | 图表类型 |
| layout_w | INTEGER | 宽度占位 |
| layout_h | INTEGER | 高度占位 |
| layout_order | INTEGER | 排序权重 |
| config | JSON | 其他图表配置 (颜色, 轴标签等) |

### 3.3 `[dynamic_log_table]` (动态日志数据表)
*   由 AI 根据日志结构动态生成的表，存储实际日志数据。
