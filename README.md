# 卸车数据集指标对比工具

用于记录、管理和对比卸车算法在不同数据集上的测试指标，支持 AI 智能分析两版本间的差异。

## 功能

- **记录管理**：新增、编辑、删除测试记录，支持按机器人型号、放置方式、CPU/GPU 配置分类
- **指标对比**：选择基准版本与测试版本，按维度（基础/失败/耗时/超时/质量）对比各项指标的变化
- **AI 分析**：调用 Claude 对两个版本的指标差异生成综合分析报告

## 架构

```
index.html          # 前端（React via CDN，单文件，无构建步骤）
worker/index.js     # Cloudflare Worker（REST API + AI 转发）
wrangler.toml       # Worker 部署配置
functions/          # Cloudflare Pages Functions（路由 /api/* 至 Worker）
```

- **前端**：部署在 Cloudflare Pages
- **后端**：Cloudflare Worker，数据存储于 Cloudflare KV
- **AI**：经由 Cloudflare AI Gateway 转发至 Anthropic API

## API

| 方法     | 路径              | 说明         |
|----------|-------------------|--------------|
| GET      | `/records`        | 获取所有记录 |
| POST     | `/records`        | 新增记录     |
| PUT      | `/records/:id`    | 更新记录     |
| DELETE   | `/records/:id`    | 删除记录     |
| POST     | `/analyze`        | AI 指标分析  |

## 本地开发

需要安装 [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)。

```bash
# 安装依赖
npm install -g wrangler

# 登录 Cloudflare
wrangler login

# 本地启动 Worker（含 KV 模拟）
wrangler dev worker/index.js

# 直接用浏览器打开 index.html 即可预览前端（将 WORKER_URL 改为本地地址）
```

## 部署

### 1. 创建 KV 命名空间

```bash
wrangler kv:namespace create UNLOAD_KV
```

将返回的 `id` 填入 `wrangler.toml`：

```toml
[[kv_namespaces]]
binding = "UNLOAD_KV"
id = "<your-kv-id>"
```

### 2. 部署 Worker

```bash
wrangler deploy
```

### 3. 部署前端

将仓库连接到 Cloudflare Pages，或手动上传 `index.html` 和 `functions/` 目录。

### 4. 配置 Anthropic API Key

在 Cloudflare Worker 的环境变量中设置：

```
ANTHROPIC_API_KEY=sk-ant-...
```

## 指标说明

| 维度 | 指标 |
|------|------|
| 基础 | 总数据集数量、实际执行次数、无效数据量 |
| 失败 | 运动规划失败、二次规划失败、抓放处理失败、超时次数 |
| 耗时 | 任务/单次/抓放/执行平均耗时，MP 超过 PP 耗时比 |
| 超时 | MP 任务/单次超时次数、PP 超时次数 |
| 质量 | 碰撞次数、每次平均抓取箱数、多抓率、侧抓拉出次数 |
