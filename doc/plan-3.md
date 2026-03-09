# 开发计划：第三阶段 - 扩展与增强 (Phase 3: Extensions & Enhancements) ✅

## 1. 目标概述 (Objective)
本阶段的核心目标是提升系统的灵活性和通用性。通过引入对 MySQL、PostgreSQL 等主流数据库的支持，以及集成 OpenAI、Anthropic、DeepSeek 等多家 AI 服务提供商，使系统能够适应更广泛的应用场景。

## 2. 核心任务 (Core Tasks)

### 2.1 多数据库支持 (Multi-Database Support)
* [x] **任务 1: 数据库层重构与驱动安装**
    * 扩展 `DataSourceType` 以支持 `mysql` 和 `postgresql`。
    * 安装相应驱动：`pnpm add mysql2 pg`。
    * 重构 `src/lib/db.ts` 中的 `getDatasourceDbInstance`，利用 Knex 统一不同方言的连接管理。
* [x] **任务 2: 动态连接配置界面**
    * 重构 `AddDataSourceDialog.tsx`，支持根据所选数据库类型切换配置表单。
    * 为 SQLite 提供文件路径输入，为 MySQL/Postgres 提供 Host/Port/Auth 等字段。
    * 完善 `addDataSource` server action，支持多类型数据库的初始化与元数据获取。

### 2.2 多 AI 提供商支持 (Multi-AI Provider Support)
* [x] **任务 3: 集成主流 AI Provider**
    * 安装 Vercel AI SDK 扩展包：`pnpm add @ai-sdk/openai @ai-sdk/anthropic @ai-sdk/deepseek`。
    * 在 `src/lib/ai.ts` 中根据环境变量 `AI_PROVIDER` (openai, anthropic, deepseek, doubao) 动态初始化模型。
* [x] **任务 4: 适配 Chat API 与 Tools**
    * 更新 `src/app/api/chat/route.ts` 以支持动态 Provider 切换。
    * 确保 `runSql` 和 `generateView` 工具在不同模型下都能稳定生成正确格式的 SQL 和配置。

## 3. 验收标准 (Acceptance Criteria)
1. **数据库连通性**: 能够成功添加并连接 MySQL/PostgreSQL 实例，获取表结构。 (已完成)
2. **多模型生成**: 分别切换至 OpenAI、Anthropic 或 DeepSeek 后，仍能正确通过自然语言生成可视化图表。 (已完成)
3. **向向兼容**: 默认配置（SQLite + 豆包 AI）功能完全保留且不受影响。 (已完成)

## 4. 注意事项 (Notes)
* **安全性**: 对远程数据库连接应提供 SSL/TLS 支持，并严格通过环境变量管理敏感 API Keys。
* **兼容性**: 针对不同数据库的 SQL 方言差异，在 Prompt 中显式包含当前 `dbType` 以引导 AI 生成正确的语句。
* **性能**: 后续可考虑引入数据库连接池管理以提升在高并发场景下的稳定性。
