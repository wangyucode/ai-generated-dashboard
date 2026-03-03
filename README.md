# AI-Enhanced Log Analyzer / AI 驱动的日志分析器

A modern, full-stack Next.js application that leverages AI to parse, analyze, and visualize any application(like Nginx, Caddy) structured logs. It transforms raw log data into valuable data visualization dashboards through an intelligent, AI-driven workflow.

这是一个现代化的全栈 Next.js 应用，利用 AI 解析、分析和可视化任意应用(如Nginx、Caddy)的结构化日志。它通过智能的AI驱动工作流，将原始日志数据转化为有价值的数据可视化面板。

## ✨ Core Features / 核心功能

### 🤖 AI-Powered Analysis / AI 智能分析:

- AI automatically analyzes log formats and generates parsing functions.
- Provides visualization suggestions based on data.
- Generates custom visualization charts through natural language conversation with AI.
- You decide which AI-generated visualization charts to save to your dashboard.

- AI自动分析日志格式并生成解析函数。
- 由AI根据数据提供可视化建议。
- 使用自然语言和AI对话生成自定义的可视化图表。
- 由您决定将哪些 AI 生成的可视化图表保存到仪表盘。

## 🛠 Deployment / 部署

Recommended for convenient deployment using Docker and Docker Compose.

推荐使用 Docker 和 Docker Compose 进行便捷部署。

### Docker

```bash
docker run -d -p 3000:3000 -v ./logs:/app/logs -v ./data:/app/data --env OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxx
```

### Docker Compose file / Docker Compose 配置文件

```yml
version: "3.8"

services:
  app:
    build: .
    container_name: ai-log-analyzer
    restart: unless-stopped
    ports:
      - "3000:3000"
    volumes:
      - ./logs:/app/logs
      - ./data:/app/data
    environment:
      - OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxx
```

## 🔧 Technologies Stack / 技术栈

- **Framework/框架**: Next.js <https://nextjs.org/>
- **Language/语言**: TypeScript <https://www.typescriptlang.org/>
- **UI Components/UI组件**: shadcn/ui <https://ui.shadcn.com/>
- **Styling/样式**: Tailwind CSS <https://tailwindcss.com/>
- **Charts/图表**: Apache ECharts <https://echarts.apache.org/>
- **Database/数据库**: DuckDB <https://duckdb.org/>
- **State Management/状态管理**: Zustand <https://zustand-demo.pmnd.rs/>
- **AI Interaction/AI交互**: Vercel AI SDK <https://vercel.com/docs/ai-sdk>
- **File Watching/文件监控**: Chokidar <https://github.com/paulmillr/chokidar>
- **Package Manager/包管理器**: pnpm <https://pnpm.io/>
- **Containerization/容器化**: Docker & Docker Compose
