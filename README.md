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

### Configuration / 配置

Create a `.env` file or configure environment variables directly in `docker-compose.yml`:

创建 `.env` 文件或直接在 `docker-compose.yml` 中配置环境变量：

| Variable             | Description                                                        | Default                    |
| :------------------- | :----------------------------------------------------------------- | :------------------------- |
| `LOG_RETENTION_DAYS` | Number of days to keep parsed logs in the database. (日志保留天数) | `30`                       |
| `OPENAI_API_KEY`     | API Key for the AI analysis engine. (AI 分析引擎的 API Key)        | -                          |
| `DATABASE_URL`       | Path to the SQLite database. (SQLite 数据库路径)                   | `file:/app/data/sqlite.db` |

## 🔧 Technologies Used / 技术栈

- Framework: Next.js <https://nextjs.org/>
- UI: Shadcn UI <https://ui.shadcn.com/>
- Styling: Tailwind CSS <https://tailwindcss.com/>
- Charting: Echarts <https://echarts.apache.org/>
- Language: TypeScript <https://www.typescriptlang.org/>
- Database: SQLite <https://www.sqlite.org/>
- Docker & Docker Compose <https://www.docker.com/>
