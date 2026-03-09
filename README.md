# AI-Powered Data Visualizer / AI 驱动的数据可视化工具

A modern, full-stack Next.js application that leverages AI to analyze and visualize data from any database. It transforms raw database records into valuable data visualization dashboards through an intelligent, AI-driven workflow, requiring zero backend or frontend coding.

这是一个现代化的全栈 Next.js 应用，利用 AI 分析和可视化任意数据库数据，将原始数据库数据转化为有价值的数据可视化面板，而不需要任何后端和前端代码。

## ✨ Core Features / 核心功能

### 🤖 AI-Powered Analysis / AI 智能分析:

- Extensive Support: Supports analysis and visualization of data from any database(MySQL, PostgreSQL, SQLite).
- Intelligent: Provides visualization suggestions based on data via AI.
- Easy to Use: Generates custom visualization charts through natural language conversation with AI.
- Customizable: You decide which AI-generated visualization charts to save to your dashboard, and supports custom modifications.
- Secure: Connects to your database in read-only mode by default; configurable admin password.

- 支持广泛：支持任意数据库数据的分析和可视化(MySQL, PostgreSQL, SQLite)。
- 智能化：由AI根据数据提供可视化建议。
- 操作简单：使用自然语言和AI对话生成自定义的可视化图表。
- 自定义：由您决定将哪些 AI 生成的可视化图表保存到仪表盘，并支持自定义修改。
- 安全：默认以只读模式连接你的数据库；可配置的管理密码。

## Development / 开发

```bash
pnpm install
pnpm dev
```

The application will be available at <http://localhost:3000>.

## Environment Variables / 环境变量

复制 `.env.example` 为 `.env.local` 并配置以下环境变量：

Copy `.env.example` to `.env.local` and configure the following environment variables:

| 变量名 / Variable | 描述 / Description | 默认值 / Default |
| :--- | :--- | :--- |
| `AI_PROVIDER` | AI 提供商，可选 `doubao`, `openai`, `anthropic`, `deepseek` | `doubao` |
| `API_KEY` | AI 服务的 API KEY (适用于所有提供商) | - |
| `MODEL_ID` | 模型接入点 ID (Endpoint ID) 或模型名称 | `doubao-seed-2-0-mini-260215` |
| `OPENAI_BASE_URL` | OpenAI API 代理地址 (可选) | - |
| `ADMIN_PASSWORD` | 管理员登录密码，用于配置数据源 | `admin456` |

## 部署 / Deployment

docker compose:

```yml
version: '3'

services:
  app:
    image: wangyucode/ai-generated-dashboard
    ports:
      - 3000:3000
    environment:
      - API_KEY=your_api_key
      - ADMIN_PASSWORD=your_secure_password
    volumes:
      - <your_local_db_file_path>:/app/data/db/sqlite.db:ro # sqlite db file must mount to /app/data/db/
```

## 🔧 Technologies Stack / 技术栈

- **Framework/框架**: Next.js <https://nextjs.org/>
- **Language/语言**: TypeScript <https://www.typescriptlang.org/>
- **UI Components/UI组件**: shadcn/ui <https://ui.shadcn.com/>
- **Styling/样式**: Tailwind CSS <https://tailwindcss.com/>
- **Testing/测试**: Vitest <https://vitest.dev/>
- **Charts/图表**: Vega-Lite <https://vega.github.io/vega-lite/>
- **Database/数据库**: SQLite <https://www.sqlite.org/>
- **SQL query builder/SQL 查询构建器**: knex.js <https://knexjs.org/>
- **State Management/状态管理**: Zustand <https://zustand-demo.pmnd.rs/>
- **AI Interaction/AI交互**: Vercel AI SDK <https://vercel.com/docs/ai-sdk>
- **Package Manager/包管理器**: pnpm <https://pnpm.io/>
- **Containerization/容器化**: Docker & Docker Compose
