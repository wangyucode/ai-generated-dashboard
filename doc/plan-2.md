# 开发计划：第二阶段 - 数据分析与可视化生成 (Phase 2: Data Analysis & Visualization Generation)

## 1. 目标概述 (Objective)
本阶段的核心目标是实现基于 AI 的数据分析与可视化生成。用户在选择了数据源中的表格后，通过 AI 对话框描述需求（或使用默认提示词），系统自动分析表结构，生成可视化图表配置，并保存到数据库中。

## 2. 详细开发步骤 (Development Steps)

### 2.1 AI 环境与后端基础 (AI Setup & Backend Foundation)
*   [x] **任务 1: AI Provider 配置**
    *   [x] **文件**: `.env.local` (已创建), `src/lib/ai.ts` (已创建)
    *   [x] **内容**:
        *   配置 AI SDK (使用 Vercel AI SDK)。
        *   准备使用豆包模型，所以需要安装 `doubao-ai-provider` (已安装)。
        *   封装统一的 AI 调用接口。
*   [x] **任务 2: 创建 Chat API Route**
    *   [x] **文件**: `src/app/api/chat/route.ts` (已创建)
    *   [x] **内容**:
        *   实现 POST 接口，接收 `messages` (对话历史) 和 `data` (包含 `selectedTables`, `dataSourceId`)。
        *   **System Prompt 构建**:
            *   获取选中表格的 Schema (列名、类型)。
            *   获取已有的 Views (作为参考)。
            *   设定角色：数据可视化专家。
            *   设定输出格式：必须返回包含 Vega-Lite 配置的 JSON (或使用 AI SDK 的 `tool-calling`/`structured-output` 功能)。
        *   调用 AI 模型并流式返回结果。

### 2.2 前端交互升级 (Frontend Interaction Upgrade)
*   [ ] **任务 3: 改造 AddViewCard 组件状态**
    *   [ ] **文件**: `src/components/cards/view/AddViewCard.tsx`
    *   [ ] **内容**:
        *   引入步骤状态管理: `step` ('select-table' | 'ai-chat')。
        *   默认显示表格选择界面 (现有逻辑)。
*   [ ] **任务 4: 实现表格选择步骤 (Table Selection Step)**
    *   [ ] **文件**: `src/components/cards/view/steps/TableSelectionStep.tsx` (新建)
    *   [ ] **内容**:
        *   迁移并优化现有的表格选择逻辑。
        *   支持多选。
        *   "下一步" 按钮：验证至少选择一张表，点击后进入 `ai-chat` 步骤。
*   [ ] **任务 5: 实现 AI 对话步骤 (AI Chat Step)**
    *   [ ] **文件**: `src/components/cards/view/steps/AIChatStep.tsx` (新建)
    *   [ ] **内容**:
        *   使用 `useChat` hook (from `ai/react`)。
        *   **初始化**: 进入该步骤时，默认消息："基于现有数据和现有view添加一个新的可视化视图"。
        *   **界面**:
            *   消息列表区域 (User & AI)。
            *   输入框 (允许用户补充需求)。
            *   加载状态展示。
        *   **结果处理**:
            *   当 AI 返回结构化的视图配置时，自动解析。
            *   展示 "生成成功" 预览卡片。
            *   提供 "保存视图" 按钮。

### 2.3 视图存储与展示 (View Persistence & Display)
* [x] **任务 6: 完善数据库 Views 表**
    *   [x] **文件**: `src/lib/db.ts`
    *   [x] **内容**:
        *   确保 `views` 表包含必要的字段:
            *   `id` (PK)
            *   `data_source_id` (FK)
            *   `name` (视图名称)
            *   `type` (图表类型)
            *   `config` (JSON, Vega-Lite spec)
            *   `description` (AI 生成的描述)
            *   `created_at`
*   [x] **任务 7: 保存视图 Server Action**
    *   [x] **文件**: `src/app/actions/view.ts` (已创建)
    *   [x] **内容**:
        *   `saveView(viewData)`: 将 AI 生成的配置存入 `views` 表。
        *   `getViews(dataSourceId)`: 获取指定数据源的所有视图。
*   [x] **任务 8: Dashboard 集成**
    *   [x] **文件**: `src/components/ViewGrid.tsx` (新建 or 集成到 page)
    *   [x] **内容**:
        *   根据当前 `dataSourceId` 获取并渲染所有保存的视图。
        *   使用 Vega-Lite (如 `react-vega`) 渲染图表。

## 3. 验收标准 (Acceptance Criteria)
1.  [x] **流程连贯**: 用户选择表格 -> 自动进入对话 -> AI 自动生成 -> 保存展示，全流程无阻碍。
2.  [x] **AI 响应**:
    *   [x] 默认提示词能触发有效的 JSON 输出。
    *   [x] 输出包含合法的 Vega-Lite 配置。
3.  [x] **数据关联**: 生成的图表字段必须真实存在于选中的表格中。
4.  [x] **持久化**: 刷新页面后，生成的图表依然显示。

## 4. 注意事项 (Notes)
*   **Prompt Engineering**: 核心难点在于让 AI 稳定输出符合 Schema 的 JSON。建议在 System Prompt 中强约束字段名。
*   **Error Handling**: 处理 AI 生成错误 JSON 或幻觉字段的情况 (可在前端做简单校验)。
