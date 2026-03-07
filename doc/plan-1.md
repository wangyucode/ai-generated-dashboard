# 开发计划：第一阶段 - 数据源管理 (Phase 1: Data Source Management)

## 1. 目标概述 (Objective)
本阶段的核心目标是让用户能够连接到本地 SQLite 数据库，并将其元信息（表结构、元数据等）保存到系统的 Meta Database 中。系统将支持自动扫描数据库表数量，并提供 UI 界面进行数据源的添加与管理。

## 2. 环境准备 (Environment Setup) [DONE]
*   [x] **安装依赖**: 
    *   `pnpm add knex better-sqlite3` (数据库操作)
    *   `pnpm add -D @types/better-sqlite3`
*   [x] **配置 Knex**: 在根目录或 `src/lib` 下配置 `knex` 实例，用于操作系统自身的 `meta.db`。

## 3. 详细开发步骤 (Development Steps)

### 3.1 数据库层 - Meta Database 初始化
*   **文件**: `src/lib/db.ts`
*   **任务**: 
    *   初始化一个名为 `meta.db` 的本地 SQLite 数据库。
    *   创建 `data_sources` 表，包含以下字段：
        *   `id` (INTEGER PK)
        *   `type` (TEXT, e.g., 'sqlite')
        *   `connection_info` (TEXT, JSON string)
        *   `name` (TEXT, 数据源别名)
        *   `database` (TEXT, 数据库路径/名称)
        *   `table_count` (INTEGER)
        *   `created_at` (DATETIME)
    *   创建 `views` 表（为后续阶段做准备）。

### 3.2 状态管理 (State Management)
*   **文件**: `src/store/useDataSourceStore.ts`
*   **任务**: 
    *   使用 Zustand 创建一个 store。
    *   状态：`currentDataSource` (数据源对象或 null)。
    *   操作：`setCurrentDataSource(ds: DataSource)`。

### 3.3 Server Actions (后端逻辑)
*   **文件**: `src/app/actions/dataSource.ts`
*   **任务**:
    *   `getDataSource()`: 从 `meta.db` 查询第一个（或最新一个）数据源。
    *   `addDataSource(payload)`:
        1.  验证 SQLite 文件是否存在。
        2.  使用 `knex` 连接到该 SQLite 数据库，扫描 `sqlite_master` 获取表数量。
        3.  将信息存入 `meta.db` 的 `data_sources` 表。
        4.  返回保存成功的数据源信息。

### 3.4 UI 组件开发
*   **数据源管理组件 (`src/components/DataSourceManager.tsx`)**:
    *   作为容器组件，判断是否存在 `currentDataSource`。
    *   统一使用 `DashboardCard` (order: -1) 作为外层包装。
    *   根据状态渲染 `NoDataSourceFound` 或 `DataSourceInfo`。
*   **空状态组件 (`src/components/NoDataSourceFound.tsx`)**:
    *   标题：“未连接数据源”。
    *   描述：“请连接一个数据库以开始 AI 数据分析”。
    *   内容：一个“添加数据源”按钮，点击打开 `AddDataSourceDialog`。
*   **数据源信息组件 (`src/components/DataSourceInfo.tsx`)**:
    *   展示当前数据源的名称、路径、表数量、创建时间。
    *   提供“切换/编辑”入口（可选）。
*   **添加数据源对话框 (`src/components/AddDataSourceDialog.tsx`)**:
    *   使用 `shadcn/ui` 的 `Dialog` 组件。
    *   表单项：
        *   数据库类型（目前仅限 SQLite）。
        *   别名 (Name)。
        *   数据库文件名 (File)。
    *   确认按钮触发 `addDataSource` server action。

### 3.5 页面集成 (`src/app/page.tsx`)
*   **任务**:
    *   将 `page.tsx` 改为 Server Component。
    *   `await getDataSource()` 获取当前数据源。
    *   将结果传递给 Client Component 或直接在服务端渲染 `DataSourceManager`。
    *   在 `layout.tsx` 或 `page.tsx` 中同步数据源状态到 Zustand store。

## 4. 验收标准 (Acceptance Criteria)
1.  **数据库连接**: 能够正确读取用户提供的本地 `.db` 文件。
2.  **元数据扫描**: 能够正确统计该数据库中的表数量。
3.  **持久化**: 刷新页面后，已添加的数据源信息依然存在。
4.  **UI 交互**: 弹出框表单校验通过，提交后 UI 能够即时反馈（显示数据源卡片）。

## 5. 后续计划 (Next Steps)
*   第二阶段：AI 自动扫描表结构，并提供可视化建议。
