# AI Log Analyzer 开发计划 (MVP Phase)

本文档基于 `requirements.md` (MVP Update) 和 `README.md` 制定，旨在将开发过程拆解为细粒度、可独立验证的步骤。

## 阶段 1: 项目初始化与基础架构 (Initialization & Infrastructure)

### 1.1 初始化项目骨架
- [x] **任务**: 使用 Next.js 初始化项目，配置 TypeScript, Tailwind CSS。
- [x] **验证**: `pnpm dev` 能够启动默认页面。

### 1.2 集成 Shadcn UI 与基础组件
- [x] **任务**: 安装 shadcn-ui，添加 Button, Card, DropdownMenu, Dialog, Input, ScrollArea 等常用组件。

### 1.3 数据库环境搭建 (DuckDB)
- [x] **任务**: 安装 `duckdb-async` 

### 1.4 目录结构与模拟数据
- [x] **任务**: 创建 `logs/` 目录，放入几个测试日志文件。

## 阶段 2: 日志文件管理 (Log Management)

### 2.1 后端：日志文件扫描 API
- [x] **任务**: 创建 API `GET /api/logs/scan`，扫描 `logs/` 目录下的文件。
- [x] **验证**: 访问 API 能返回文件列表 JSON。

### 2.2 数据库：日志元数据表 (`log_files`)
- [x] **任务**: 在应用启动或首次访问时，初始化 SQLite/DuckDB 中的 `log_files` 表 (id, file_path, status, etc.)。
- [x] **验证**: 查询数据库确认表已创建。

### 2.3 前端：日志状态管理 (Zustand)
- [x] **任务**: 创建 `store/useLogStore.ts`，管理当前选中的日志文件和文件列表。
- [x] **验证**: 在页面展示从 API 获取的日志文件列表。

### 2.4 前端：顶部导航栏与文件选择
- [x] **任务**: 实现顶部导航栏，包含文件选择下拉菜单。
- [x] **验证**: 能够通过下拉菜单切换当前选中的日志文件 ID。

## 阶段 3: Caddy JSON 日志解析 (MVP Initialization)

### 3.1 预定义 Caddy JSON 表结构
- [ ] **任务**: 在 `lib/db.ts` 或单独的 `schema` 文件中定义 Caddy JSON 日志对应的 DuckDB `CREATE TABLE` 语句。
- [ ] **验证**: 手动在 DuckDB CLI 或测试脚本中运行该语句，确认表创建成功。

### 3.2 实现硬编码解析器 (Hardcoded Parser)
- [ ] **任务**: 创建 `lib/parsers/caddy.ts`，实现读取 JSON 文件的逻辑。
    1. 逐行读取文件 (使用流式读取以支持大文件)。
    2. 解析每一行为 JSON 对象。
    3. 提取关键字段 (ts, duration, request.remote_ip, request.method, request.uri, status, size, user_agent 等)。
    4. 构造批量 `INSERT` 语句。
- [ ] **验证**: 编写单元测试，输入几行 Caddy JSON 日志，输出正确的 SQL 插入语句。

### 3.3 后端：执行初始化 (Initialize API)
- [ ] **任务**: 更新或创建 API `POST /api/logs/:id/initialize`。
    1. 根据文件扩展名或内容简单判断是否为 JSON。
    2. 调用 Caddy 解析器处理文件。
    3. 在 DuckDB 中执行建表和数据插入。
    4. 更新 `log_files` 表状态为 `READY`，记录 `table_name` 为 `caddy_access_logs` (或带文件 ID 后缀)。
- [ ] **验证**: 点击前端“初始化”按钮后，数据库中出现对应的日志表且有数据。

### 3.4 前端：初始化状态反馈
- [ ] **任务**: 在“App Info”卡片中，如果当前文件未初始化，显示“初始化”按钮；初始化中显示 Loading；完成后显示“已就绪”。
- [ ] **验证**: 完整跑通点击初始化到状态更新的流程。

## 阶段 4: 仪表盘与基础视图 (Dashboard & Layout)

### 4.1 仪表盘网格布局
- [ ] **任务**: 引入 Grid 布局库 (如 `react-grid-layout` 或简单的 CSS Grid)。
- [ ] **验证**: 页面展示一个空的网格区域。

### 4.2 默认视图 (App Info)
- [ ] **任务**: 实现 "App Info" 卡片，显示当前日志文件的统计信息（总记录数、最早/最晚时间、常见状态码分布等）。
- [ ] **验证**: 仪表盘默认显示该卡片，数据从 DuckDB 查询而来，准确无误。

### 4.3 数据库：视图配置表 (`views`)
- [ ] **任务**: 创建 `views` 表，用于存储图表配置 (id, log_file_id, title, query, type, layout)。
- [ ] **验证**: 表结构正确。

## 阶段 5: 交互式视图生成 (Interactive View Generation)

### 5.1 视图创建入口
- [ ] **任务**: 在仪表盘末尾添加 "+" 号卡片，点击弹出对话框。
- [ ] **验证**: 点击能打开对话框。

### 5.2 AI 视图生成 API (SQL Generation)
- [ ] **任务**: 创建 API `POST /api/views/generate`。
    - **Input**: 用户 Prompt (e.g., "Show me requests per hour")。
    - **Context**: 提供 Caddy 日志表的 Schema (字段名、类型)。
    - **Output**: AI 生成的 SQL 查询 (DuckDB 语法) 和 ECharts 配置建议。
- [ ] **验证**: 输入 "统计每小时请求数"，AI 返回包含 `SELECT time_bucket(...)` 的 SQL。

### 5.3 动态图表渲染组件
- [ ] **任务**: 封装 `ChartComponent`，基于 ECharts，根据传入的 type (Line, Bar, Pie) 和 data 渲染图表。
- [ ] **验证**: 手动传入 mock 数据，能渲染出图表。

### 5.4 预览与执行
- [ ] **任务**: 在对话框中，前端拿到 AI 生成的 SQL，调用后端 `POST /api/query` 执行查询，并将结果渲染在预览区。
- [ ] **验证**: 对话框中能看到根据 Prompt 生成的图表预览。

## 阶段 6: 视图持久化与管理 (View Management)

### 6.1 保存视图
- [ ] **任务**: 在预览对话框中添加“保存”按钮，将视图配置写入 `views` 表。
- [ ] **验证**: 保存后，仪表盘自动刷新，显示新添加的图表卡片。

### 6.2 视图编辑与删除
- [ ] **任务**: 允许用户调整视图大小、位置，或删除视图。
- [ ] **验证**: 调整布局后，刷新页面布局保持不变 (需持久化布局配置)。
