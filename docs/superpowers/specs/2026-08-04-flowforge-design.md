# FlowForge 设计文档

- 日期：2026-08-04
- 状态：已确认，待评审
- 定位：Dify-like 的 AI 工作流可视化编排系统，核心卖点是"AI 白盒可观测"

## 1. 动机与要解决的问题

**一句话价值主张：** 把 AI 应用从"输入 → 黑盒 → 输出"，变成"可视化编排、逐步可观测、单点可调试"的流水线。

解决的两类问题：

1. **重复流程自动化**：多步骤任务（数据搬运、格式转换、AI 处理链）每次都要写一次性脚本，不可复用。本系统让流程以节点图形式被编排并真正执行。
2. **AI 黑盒不可控**：直接调用大模型结果不可预知、出错无法定位。本系统把一次调用拆成多步流水线，每一步的输入、输出、耗时、token 消耗都可见，可单点重跑、可换模型。

**目标用户：** 开发者本人 + 面试演示（单用户、无账号）。

## 2. 成功标准（"做完"的定义）

1. `npm run dev` 一键启动前后端，本地可完整使用
2. 类型检查（client + server）和单元测试全部通过
3. README 完整：mermaid 架构图、启动方式、三个预置演示工作流、技术选型理由
4. 三个演示工作流可跑通：
   - 基础问答：开始 → LLM → 结束
   - 条件分流：开始 → LLM → 条件分支 →（命中/未命中）→ 结束
   - Mock 检索链路：开始 → HTTP（mock 检索接口）→ LLM → 结束
   - 预置工作流以模板形式内置，随仓库提供，启动后立即可见
5. 运行过程逐步可观测：节点状态实时更新、节点级日志可见、LLM 流式输出可见、运行历史可回放
6. 部署上线：前端部署到 Vercel、后端部署到 Render（或同类免费服务），提供可访问的线上 URL；预置工作流 + Mock 模式开箱即用，简历可附线上链接

## 3. 非目标（明确不做）

- 账号系统、多用户、权限（线上演示仍为单用户无账号）
- 知识库检索（RAG）：仅作为 stretch，优先级低于一切核心链路
- WebSocket：仅作为 stretch，通过事件通道抽象预留
- 节点类型不无限扩展，MVP 固定六种

## 4. 总体架构

仓库：`E:\Develop\FlowForge`，npm workspaces 三包：

```
E:\Develop\FlowForge\
├─ shared/    # Schema 类型、节点元数据、校验（前后端唯一事实来源）
├─ server/    # Express + SQLite + 执行引擎 + LLM/Mock 客户端
├─ client/    # React + Vite + React Flow + Zustand
├─ docs/      # 设计文档
└─ package.json  # npm workspaces 根
```

### 4.1 技术选型

| 层 | 选型 | 理由 |
|---|---|---|
| 前端框架 | React 18 + TypeScript + Vite | 简历主线技术栈 |
| 画布 | React Flow (xyflow) | 行业标准，避免从零写连线导致烂尾 |
| 前端状态 | Zustand | 轻量，三个 store 职责清晰 |
| 后端 | Node.js + Express | 与实习 AWS SAM 经验衔接 |
| 存储 | SQLite (better-sqlite3) | 单用户本地、零安装、ACID 事务；数据量级小；为将来迁移 PostgreSQL 留薄封装 |
| 运行通信 | SSE（服务端→客户端单向事件流） | 只需要单向推送；自带重连；事件总线抽象隔离传输层 |
| 测试 | Vitest + supertest + React Testing Library | 引擎单测为主 |
| CI | GitHub Actions | push/PR 跑 type-check + vitest |

### 4.2 通信链路

- REST：工作流 CRUD、创建运行、取消运行（`POST /runs/:id/cancel`）
- SSE：`GET /runs/:id/events` 推送运行过程事件
- 事件总线抽象：server 侧每个运行实例一个事件流，SSE 是一个适配器；client 侧统一订阅封装进入 `runStore`。将来加 WebSocket 只新增适配器，引擎和 UI 不变
- 内置 mock 接口（如 `GET /api/mock/search`）供 HTTP 节点演示"检索"链路，无需外部依赖
- 线上 SSE 需要心跳保活（约 15s 发送一个注释帧），避免代理/负载均衡空闲超时断开连接

### 4.3 部署形态

- 前端：Vercel 静态托管（GitHub 推送自动部署）
- 后端：Render 免费 Web Service（长期运行的 Node 进程，支持 SSE；GitHub 推送自动部署）
- 账号：部署需要用户注册免费的 Vercel 与 Render 账号（浏览器操作，可用 GitHub 账号 OAuth 登录）
- CORS：允许前端域名访问后端 API；LLM API Key 只存在于服务端环境变量，不进入前端代码
- 线上默认 Mock 模式，预置工作流随启动幂等 seed，打开网站即可演示；配置了真实 Key 才走真实 LLM
- 数据持久化：免费层没有持久磁盘，用户创建的数据在实例重启/休眠后可能丢失；线上演示以预置工作流为准。本地开发仍用 SQLite 完整持久化。正式持久化升级路径：PostgreSQL / MongoDB Atlas（数据访问层保持薄封装，迁移面小）

## 5. 数据模型（shared 包）

### 5.1 WorkflowSchema

```ts
interface WorkflowSchema {
  id: string
  name: string
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
  createdAt: string
  updatedAt: string
}

interface WorkflowNode {
  id: string
  type: 'start' | 'llm' | 'code' | 'condition' | 'http' | 'end'
  position: { x: number; y: number }
  config: Record<string, unknown> // 各节点类型的配置
}

interface WorkflowEdge {
  id: string
  source: string
  sourcePort: string
  target: string
  targetPort: string
}
```

### 5.2 变量系统

- 节点可声明输出（如 `llm_node.output`）
- 下游节点用 `{{nodeId.output}}` 语法引用
- 支持插值的位置：LLM Prompt 模板、HTTP URL/Body、条件表达式
- 运行时类型：string / number / boolean / object / array

### 5.3 节点注册表

- 节点元数据（类型名、中文名、输入/输出端口、属性表单 schema）放 shared
- 执行器（`execute(ctx, config)`）放 server
- 元数据单一来源，前端属性面板由元数据驱动渲染
- `condition` 节点输出端口为 `true` / `false`（另含 `result`），用于分支选路

## 6. 执行引擎（server 包）

### 6.1 校验

- 环检测（Kahn 拓扑排序）
- 孤立节点
- 引用了不存在的节点输出
- 缺失必填配置

### 6.2 执行

- 拓扑排序，同层无依赖节点并行执行
- MVP 采用 Node-RED 风格 OR-join：节点收到任一上游交付即触发执行（独占分支可用）；多上游聚合（AND-join）不在 MVP 范围，作为已知限制记录
- 节点执行器统一接口：

```ts
interface NodeExecutor {
  execute(ctx: ExecContext, config: Record<string, unknown>): Promise<NodeOutputs>
}
```

- LLM 节点支持流式回调（token 逐字 → 事件总线）
- 任一节点失败 → 运行终止，事件带错误信息
- 取消：`POST /runs/:id/cancel` 标记取消，引擎在节点边界检查

### 6.3 事件类型

`run_started / node_started / token_stream / node_finished / node_failed / run_completed`

每个事件携带 runId、nodeId（节点相关时）、时间戳、数据。

## 7. 存储（SQLite）

三张表：

- `workflows`：整份 WorkflowSchema 存 JSON 列
- `runs`：运行元数据（workflowId、状态、开始/结束时间、整体耗时）
- `run_nodes`：每次运行中每个节点的输入、输出、状态、耗时——支撑"运行历史可回放"

## 8. 前端交互（client 包）

### 8.1 页面与布局

- 工作流列表页：创建、打开、删除
- 编辑器页四区布局：
  - 左侧：节点面板（六种节点拖拽）
  - 中间：React Flow 画布（拖放、连线、框选、删除、缩放平移、小地图）
  - 右侧：属性面板（由节点元数据驱动表单）
  - 底部：运行面板（运行/取消、运行历史、日志与流式输出区）

### 8.2 交互规则

- 连线只能从输出端口到输入端口；start 只能当起点，end 只能当终点
- 环在保存和运行时校验拦截
- 撤销/重做：命令模式（新增、删除、移动、改属性）
- 保存：Ctrl+S + 编辑防抖自动保存

### 8.3 可观测性（核心卖点）

- 运行中节点实时变色：pending 灰 → running 蓝 → success 绿 → error 红，当前执行节点高亮
- 点节点 → 抽屉展示本次运行输入、输出、耗时、token 用量
- LLM 流式输出：token 打字机效果
- 运行历史：每次运行可点开回看，支持按时间顺序回放（数据来自 run_nodes）
- Mock 模式：无 API Key 也能完整演示（LLM 节点假输出 + 假 token 流）

### 8.4 状态管理（Zustand）

- `workflowStore`：节点/边/整份 Schema
- `editorStore`：选中、历史（撤销/重做）
- `runStore`：运行状态、节点状态映射、日志流

## 9. 测试策略

- **执行引擎单测（重点）**：环检测、拓扑排序、并行执行、变量引用解析、各节点执行器（mock 外部调用）
- **API 集成测试**（supertest）：工作流 CRUD、创建运行、SSE 事件流基本路径
- **前端组件测试**（RTL）：属性面板按类型渲染、节点状态到颜色映射
- 全局 lint + type-check 干净
- CI：GitHub Actions 在 push/PR 跑 type-check + vitest

## 10. 里程碑（6 周）

| 周 | 内容 | 验收 |
|---|---|---|
| W1 | 脚手架 + shared 数据模型 + 画布基础（拖节点/连线/保存加载） | 画布能创建节点、连线、保存 |
| W2 | 属性面板 + 撤销重做 + 工作流列表页 | **kill criteria：拖节点→连线→保存→重新打开完整可用** |
| W3 | 执行引擎（校验/拓扑/并行/事件）+ 单测 | **kill criteria：3 节点工作流跑通出结果** |
| W4 | 节点执行器（LLM 真实+流式/Mock、代码、条件、HTTP）+ 运行面板 | 六种节点全部可运行 |
| W5 | 可观测性完善（高亮、日志抽屉、历史回放）+ 打磨 | 演示流程逐步可见 |
| W6 | 工程化收尾（README/CI/演示工作流）+ 部署上线（Vercel + Render + CORS + seed + 线上验证） | 满足第 2 节成功标准，线上 URL 可访问 |

stretch（仅核心链路完成后）：RAG 检索节点（自写最小管线 + 成熟组件）、WebSocket 适配器。

## 11. 风险与对策

- **画布复杂度导致烂尾** → 用 React Flow，不手写连线
- **LLM API 成本/不稳定** → Mock 模式兜底 + 短输出配置
- **时间不足** → kill criteria 兜底，RAG/WebSocket 永远最后加
- **事件通道未来要扩展** → 第 4.2 节的事件总线抽象从第一天就做
- **Render 免费层冷启动**（闲置 15 分钟休眠）→ 线上演示预置工作流 + 告知访问者首次打开可能等待数秒
- **真实 LLM Key 在线上被滥用/产生费用** → 线上默认 Mock；真实 Key 仅通过环境变量显式开启
- **SQLite 数据在免费层重启后丢失** → 预置工作流幂等 seed，用户数据丢失可接受；升级路径见 4.3
