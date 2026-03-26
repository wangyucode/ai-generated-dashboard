# AI-Powered Data Visualizer / AI 驱动的数据可视化工具

A modern, full-stack Next.js application that leverages AI to analyze and visualize data from any database. It transforms raw database records into valuable data visualization dashboards through an intelligent, AI-driven workflow, requiring zero backend or frontend coding.

这是一个现代化的全栈 Next.js 应用，利用 AI 分析和可视化任意数据库数据，将原始数据库数据转化为有价值的数据可视化面板，而不需要任何后端和前端代码。

![introduction](./introduction.jpg)

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
| `ADMIN_PASSWORD` | 管理员登录密码，用于配置数据源 | `admin456` |
| `NEXT_PUBLIC_BASE_PATH` | 构建时路径前缀，例如 `/dashboard` (默认为空) | - |

## 部署 / Deployment

### Docker Build / Docker 构建

If you need to customize the base path (e.g., `/dashboard`), pass the `NEXT_PUBLIC_BASE_PATH` argument during build:

如果你需要自定义路径前缀（如 `/dashboard`），请在构建时传入 `NEXT_PUBLIC_BASE_PATH` 参数：

```bash
docker build --build-arg NEXT_PUBLIC_BASE_PATH=/dashboard -t ai-generated-dashboard .
```

### Docker Compose

```yml
version: '3'

services:
  app:
    image: wangyucode/ai-generated-dashboard
    ports:
      - 3000:3000
    environment:
      - ADMIN_PASSWORD=your_secure_password
    volumes:
      - <your_local_db_file_path>:/app/data/db/sqlite.db:ro # sqlite db file must mount to /app/data/db/
```
> Note: The pre-built image from GitHub Actions is built with `NEXT_PUBLIC_BASE_PATH = /dashboard` by default. If you need a different path, you must rebuild the image yourself.
> 注意：GitHub Actions 预构建的镜像默认带有 `/dashboard` 路径前缀。如果需要其他路径，请自行构建镜像。

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
