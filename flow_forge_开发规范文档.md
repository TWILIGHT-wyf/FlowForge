# FlowForge 开发规范文档

## 1. 文档目标

本文档用于约束 FlowForge 项目的后续开发，保证项目在两个月开发周期内保持清晰、可维护、可扩展，并方便后续写入简历和面试讲解。

本项目的核心目标不是堆功能，而是完成一个小而完整、有工程深度的工作流编排与执行平台。开发过程中优先保证主链路闭环：

创建流程 → 编辑画布 → 配置节点 → 保存流程 → 执行流程 → 查看运行状态 → 查看节点日志。

任何功能如果不能服务于这条主链路，默认降低优先级。

---

## 2. 项目定位

项目名称：FlowForge

项目类型：通用工作流编排与执行平台

项目简介：

FlowForge 是一个面向业务流程自动化的可视化工作流平台，支持通过拖拽节点搭建流程，并提供节点配置、DAG 执行、数据流转、运行状态追踪、节点级日志查看等能力。平台支持扩展 HTTP 请求、条件判断、数据转换、人工确认、AI 调用等节点类型。

项目重点：

- 可视化流程编排
- 节点协议设计
- DAG 执行模型
- 运行状态追踪
- 节点输入输出日志
- 与真实业务流程结合

项目不追求：

- 大而全的低代码平台
- 复杂权限系统
- 多人协作
- 插件市场
- 复杂 AI Agent 平台
- 华丽但无工程深度的 UI 动效

---

## 3. 技术选型规范

### 3.1 前端技术栈

前端统一使用：

- React
- TypeScript
- Vite
- React Router
- Zustand
- TanStack Query
- React Flow / @xyflow/react
- Ant Design
- Axios

选择理由：

- Vite 负责项目构建，轻量、启动快，适合 SPA 工作流平台。
- React Router 负责页面路由，不引入 Next.js 的 SSR、Server Components 等额外复杂度。
- Zustand 负责客户端编辑态，比如画布节点、连线、选中节点、配置面板状态。
- TanStack Query 负责服务端数据，比如流程列表、流程详情、运行记录、节点日志。
- React Flow 负责工作流画布能力。
- Ant Design 快速构建后台管理类界面，减少 UI 造轮子时间。

### 3.2 后端技术栈

后端推荐使用：

- Node.js
- NestJS 或 Express / Fastify
- Prisma
- SQLite / PostgreSQL

两个月项目周期内优先使用 SQLite，降低部署和本地开发成本。后续如果需要展示生产化能力，再考虑切换 PostgreSQL。

---

## 4. 项目目录规范

### 4.1 前端目录结构

前端采用“按业务模块组织 + 少量全局基础层”的结构。

```txt
src
├─ app
├─ pages
├─ features
│  ├─ workflow
│  ├─ canvas
│  ├─ node-config
│  ├─ execution
│  └─ workflow-template
├─ shared
├─ styles
└─ main.tsx
```

### 4.2 app 目录

`app` 只放应用级配置，不放具体业务逻辑。

推荐内容：

```txt
src/app
├─ router.tsx
├─ providers.tsx
├─ query-client.ts
└─ layout
   └─ AppLayout.tsx
```

职责：

- 路由配置
- 全局 Provider
- QueryClient 配置
- 应用整体布局

禁止：

- 在 app 中写具体业务组件
- 在 app 中写流程执行逻辑
- 在 app 中写节点配置逻辑

### 4.3 pages 目录

`pages` 只放页面入口，页面负责组合 features，不直接承载大量业务逻辑。

推荐页面：

```txt
pages
├─ WorkflowListPage
├─ WorkflowEditorPage
├─ RunListPage
└─ RunDetailPage
```

页面组件应该尽量保持轻薄。

推荐写法：

```tsx
function WorkflowEditorPage() {
  return (
    <EditorLayout>
      <NodePalette />
      <WorkflowCanvas />
      <NodeConfigDrawer />
    </EditorLayout>
  )
}
```

不推荐：

- 在页面文件中直接写大量 React Flow 事件逻辑
- 在页面文件中直接写复杂接口请求
- 在页面文件中直接处理节点执行状态

### 4.4 features 目录

`features` 是核心业务模块目录。每个 feature 内部维护自己的 components、hooks、api、types、utils。

推荐结构：

```txt
features/workflow
├─ api
├─ components
├─ hooks
├─ types
└─ utils
```

各模块职责：

#### workflow

负责流程本身。

包括：

- 流程列表
- 流程详情
- 创建流程
- 保存流程
- 删除流程
- 流程类型定义

#### canvas

负责工作流画布。

包括：

- React Flow 封装
- 节点展示
- 连线
- 拖拽
- 缩放
- 选中节点
- 画布状态
- 画布与后端工作流数据结构的转换

#### node-config

负责节点配置。

包括：

- HTTP 节点配置表单
- Condition 节点配置表单
- Transform 节点配置表单
- AI 节点配置表单
- 根据节点类型渲染不同配置表单
- 节点配置校验

#### execution

负责流程执行和运行日志。

包括：

- 执行流程
- 运行记录
- 运行详情
- 节点运行状态
- 节点输入输出日志
- 错误信息展示
- 轮询运行状态

#### workflow-template

负责流程模板。

包括：

- 移动端数据更新检查流程模板
- 广告展示检查流程模板
- 模板导入
- 模板预览

### 4.5 shared 目录

`shared` 只放跨模块复用的基础能力。

推荐内容：

```txt
shared
├─ api
│  ├─ request.ts
│  └─ api-error.ts
├─ components
│  ├─ JsonViewer.tsx
│  ├─ PageHeader.tsx
│  ├─ EmptyState.tsx
│  └─ ConfirmButton.tsx
├─ constants
├─ hooks
├─ types
└─ utils
```

约束：

- 只有被两个以上 feature 复用的内容才放 shared。
- 不要把 shared 当成垃圾桶。
- 和某个业务强相关的内容，优先放在对应 feature 内。

---

## 5. 路由规范

路由统一使用 React Router。

推荐路由：

```txt
/workflows
/workflows/new
/workflows/:workflowId/edit
/runs
/runs/:runId
```

路由文件统一放在：

```txt
src/app/router.tsx
```

页面跳转统一使用：

```tsx
const navigate = useNavigate()
```

路由参数统一使用：

```tsx
const { workflowId } = useParams()
```

规范：

- 页面级路径统一集中管理，不要在组件中到处硬编码路径。
- 动态参数命名要清楚，例如 `workflowId`、`runId`。
- 不要把复杂业务状态放进 URL，URL 只保存页面定位相关信息。

---

## 6. 状态管理规范

### 6.1 状态分类

项目中的状态分为四类：

```txt
组件局部状态：useState / useReducer
客户端共享状态：Zustand
服务端数据状态：TanStack Query
路由状态：React Router
```

### 6.2 Zustand 使用范围

Zustand 只管理客户端交互状态。

适合放入 Zustand 的状态：

- 当前画布 nodes
- 当前画布 edges
- 当前选中节点 selectedNodeId
- 配置面板是否打开
- 当前流程是否有未保存修改 dirty
- 运行详情页当前选中的节点日志
- 当前高亮节点

不适合放入 Zustand 的状态：

- 流程列表
- 流程详情
- 运行记录
- 运行日志
- 后端接口返回数据

这些服务端数据交给 TanStack Query。

### 6.3 Zustand Store 规范

不要创建一个巨大的全局 store。

推荐按业务拆分：

```txt
features/canvas/stores/workflow-editor-store.ts
features/execution/stores/execution-view-store.ts
```

使用 selector 获取状态，避免订阅整个 store。

推荐：

```tsx
const nodes = useWorkflowEditorStore((state) => state.nodes)
const setNodes = useWorkflowEditorStore((state) => state.setNodes)
```

不推荐：

```tsx
const store = useWorkflowEditorStore()
```

### 6.4 TanStack Query 使用范围

TanStack Query 负责服务端状态。

包括：

- 查询流程列表
- 查询流程详情
- 保存流程
- 执行流程
- 查询运行记录
- 查询运行详情
- 查询节点日志

查询 key 命名要稳定。

示例：

```ts
['workflows']
['workflow', workflowId]
['runs']
['run', runId]
['node-runs', runId]
```

---

## 7. API 请求规范

### 7.1 Axios 实例

统一在 `shared/api/request.ts` 中创建 Axios 实例。

```ts
import axios from 'axios'

export const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
})
```

### 7.2 业务 API 分模块维护

不要把所有接口写在一个大 `api.ts` 中。

推荐：

```txt
features/workflow/api/workflow-api.ts
features/execution/api/execution-api.ts
```

### 7.3 API 函数命名

查询类：

```ts
fetchWorkflowList()
fetchWorkflowDetail(workflowId)
fetchRunDetail(runId)
```

变更类：

```ts
createWorkflow(payload)
updateWorkflow(workflowId, payload)
deleteWorkflow(workflowId)
runWorkflow(workflowId)
```

规范：

- API 函数只负责请求，不负责 UI 提示。
- API 函数必须声明入参和返回类型。
- 不要在组件中直接写 axios 请求。
- 错误处理可以在 request 拦截器和业务 hook 中分层处理。

---

## 8. TypeScript 规范

### 8.1 禁止滥用 any

默认不使用 `any`。

如确实无法确定类型，优先使用：

```ts
unknown
```

然后通过类型守卫或解析函数转换。

### 8.2 类型放置规则

业务强相关类型放在对应 feature 内。

例如：

```txt
features/workflow/types/workflow.ts
features/execution/types/execution.ts
features/node-config/types/node-config.ts
```

通用类型放在：

```txt
shared/types
```

### 8.3 命名规范

类型使用 PascalCase：

```ts
type Workflow = {}
type WorkflowNode = {}
type NodeRunStatus = 'pending' | 'running' | 'success' | 'failed'
```

函数使用 camelCase：

```ts
fetchWorkflowList()
convertFlowToWorkflow()
validateConnection()
```

常量使用大写或清晰 camelCase：

```ts
const NODE_TYPES = {}
const defaultWorkflowName = 'Untitled Workflow'
```

### 8.4 节点类型约束

节点类型必须使用联合类型或枚举约束，不允许使用散落的字符串。

推荐：

```ts
export type WorkflowNodeType =
  | 'start'
  | 'http'
  | 'condition'
  | 'transform'
  | 'manual'
  | 'ai'
  | 'end'
```

不推荐：

```ts
if (node.type === 'httpp') {}
```

---

## 9. 组件开发规范

### 9.1 组件职责单一

组件只做一件事。

例如：

- `WorkflowCanvas` 负责画布展示和事件绑定。
- `NodePalette` 负责节点列表和拖拽入口。
- `NodeConfigDrawer` 负责配置面板容器。
- `HttpNodeConfigForm` 负责 HTTP 节点配置表单。
- `RunTimeline` 负责运行时间线展示。

### 9.2 页面组件不要过重

页面组件只组合模块，不写复杂业务逻辑。

如果页面组件超过 200 行，需要考虑拆分。

### 9.3 组件命名

组件文件使用 PascalCase：

```txt
WorkflowCanvas.tsx
NodeConfigDrawer.tsx
RunStatusTag.tsx
```

自定义 hook 使用 `use-xxx.ts` 或 `useXxx.ts`，项目内保持统一。

推荐：

```txt
use-workflow-detail.ts
use-run-workflow.ts
use-canvas-events.ts
```

### 9.4 Props 类型

组件 Props 单独声明类型。

```tsx
type WorkflowCardProps = {
  workflow: Workflow
  onEdit: (workflowId: string) => void
}

export function WorkflowCard(props: WorkflowCardProps) {
  const { workflow, onEdit } = props
}
```

---

## 10. 工作流数据结构规范

### 10.1 基础结构

流程结构：

```ts
type Workflow = {
  id: string
  name: string
  description?: string
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
  createdAt: string
  updatedAt: string
}
```

节点结构：

```ts
type WorkflowNode = {
  id: string
  type: WorkflowNodeType
  name: string
  position: {
    x: number
    y: number
  }
  config: Record<string, unknown>
}
```

连线结构：

```ts
type WorkflowEdge = {
  id: string
  source: string
  target: string
  sourceHandle?: string
  targetHandle?: string
}
```

### 10.2 节点配置结构

不同节点拥有不同配置，不要全部混成一个巨大对象。

示例：

```ts
type HttpNodeConfig = {
  url: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  headers?: Record<string, string>
  body?: unknown
}
```

```ts
type ConditionNodeConfig = {
  leftPath: string
  operator: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan'
  rightValue: unknown
}
```

### 10.3 节点协议设计原则

所有节点都应该遵守统一协议：

```txt
input + config → execute → output / error
```

每个节点执行时必须记录：

- nodeId
- status
- input
- output
- error
- startedAt
- endedAt
- duration

---

## 11. 画布开发规范

### 11.1 React Flow 数据转换

React Flow 的 Node / Edge 不应直接等同于后端 WorkflowNode / WorkflowEdge。

需要提供转换函数：

```txt
features/canvas/utils/convert-flow-to-workflow.ts
features/canvas/utils/convert-workflow-to-flow.ts
```

原因：

- React Flow 节点包含 UI 信息。
- 后端工作流节点关注执行信息。
- 两者混用会导致数据结构耦合。

### 11.2 连线校验

必须实现基础连线校验。

规则：

- Start 节点不能有入边。
- End 节点不能有出边。
- Start 节点只能有一个。
- End 节点至少有一个。
- 普通节点默认只允许一个主出口。
- Condition 节点允许 true / false 两个出口。
- 不允许形成环。
- 不允许孤立节点参与保存或执行。

### 11.3 画布状态

画布编辑态由 Zustand 管理。

包括：

- nodes
- edges
- selectedNodeId
- dirty
- isConfigPanelOpen

不要把服务端流程详情直接作为画布状态使用，应该先转换成画布草稿。

---

## 12. 节点配置规范

### 12.1 按节点类型拆表单

不同节点配置表单必须拆分。

推荐：

```txt
HttpNodeConfigForm.tsx
ConditionNodeConfigForm.tsx
TransformNodeConfigForm.tsx
AiNodeConfigForm.tsx
```

不推荐：

```txt
NodeConfigForm.tsx  // 内部几百行 if else
```

### 12.2 配置表单选择器

根据节点类型选择表单的逻辑可以单独封装：

```ts
getNodeConfigForm(nodeType)
```

### 12.3 配置校验

保存流程前必须校验节点配置。

例如：

HTTP 节点：

- url 不能为空
- method 必须合法
- headers 必须是合法键值对

Condition 节点：

- leftPath 不能为空
- operator 必须合法
- true / false 分支至少配置完整

Transform 节点：

- 映射规则不能为空
- JSONPath 格式必须可解析

---

## 13. 流程执行规范

### 13.1 执行引擎职责

执行引擎只负责调度，不负责具体节点业务。

执行引擎负责：

- 读取流程定义
- 校验流程合法性
- 解析节点依赖
- 按 DAG 顺序执行
- 控制分支流转
- 记录节点运行状态
- 处理失败中断

节点执行器负责：

- 具体节点逻辑
- 处理 config
- 处理 input
- 返回 output

### 13.2 NodeExecutor 规范

推荐设计统一执行器接口：

```ts
interface NodeExecutor<TConfig = unknown> {
  execute(context: ExecuteContext, config: TConfig): Promise<NodeExecuteResult>
}
```

不同节点单独实现：

```txt
start-node.executor.ts
http-node.executor.ts
condition-node.executor.ts
transform-node.executor.ts
end-node.executor.ts
```

### 13.3 节点状态

节点运行状态统一使用：

```ts
type NodeRunStatus =
  | 'pending'
  | 'running'
  | 'success'
  | 'failed'
  | 'skipped'
```

流程运行状态统一使用：

```ts
type WorkflowRunStatus =
  | 'running'
  | 'success'
  | 'failed'
  | 'canceled'
```

### 13.4 失败处理

MVP 阶段默认规则：

- 节点失败后，流程整体失败。
- 失败节点记录 error。
- 未执行节点标记为 skipped 或 pending。
- 前端运行详情页展示失败原因。

后续扩展：

- 节点级重试
- 失败继续执行
- fallback 分支
- 超时控制

---

## 14. 运行日志规范

每次执行生成一个 runId。

每个节点生成一条 NodeRun 记录。

NodeRun 必须包含：

```ts
type NodeRun = {
  id: string
  runId: string
  nodeId: string
  status: NodeRunStatus
  input: unknown
  output: unknown
  error?: string
  startedAt?: string
  endedAt?: string
  duration?: number
}
```

前端必须支持：

- 查看流程运行记录
- 查看运行详情
- 查看每个节点的状态
- 点击节点查看 input
- 点击节点查看 output
- 失败时查看 error

运行日志是项目核心亮点之一，不允许省略。

---

## 15. Git 提交规范

### 15.1 提交格式

统一使用：

```txt
<emoji> <type>(<scope>): <subject>
```

示例：

```txt
🎉 chore: initialize project
✨ feat(canvas): add workflow editor canvas
✨ feat(node): add http node config form
🐛 fix(canvas): prevent invalid connection from end node
♻️ refactor(executor): extract node executor interface
📝 docs(readme): add project setup guide
💄 style(editor): improve workflow editor layout
✅ test(executor): add condition node tests
🔧 chore(vite): update path alias config
📦 chore(deps): install react flow and zustand
```

### 15.2 常用 type

```txt
feat: 新功能
fix: 修复问题
refactor: 重构
chore: 构建、配置、依赖、杂项
docs: 文档
style: 样式、格式，不影响逻辑
test: 测试
perf: 性能优化
```

### 15.3 常用 emoji

```txt
🎉 初始化项目
✨ 新功能
🐛 修 bug
♻️ 重构
📝 文档
💄 UI / 样式
✅ 测试
🔧 配置
📦 依赖 / 打包
🔥 删除代码或文件
⚡️ 性能优化
🚀 部署
```

### 15.4 提交粒度

推荐小步提交。

一个 commit 只做一类事情。

推荐：

```txt
✨ feat(canvas): support node drag and connection
✨ feat(node): add http node config form
```

不推荐：

```txt
✨ feat: add many things
```

### 15.5 提交前检查

每次提交前确认：

- 项目能正常启动
- 没有明显 console error
- 没有无意义注释
- 没有临时代码
- 没有无用文件
- commit message 能说明本次修改

---

## 16. 分支规范

个人开发可以使用简单分支模型。

推荐：

```txt
main
feature/canvas-editor
feature/workflow-execution
feature/run-log
fix/connection-validation
```

规则：

- main 分支保持可运行。
- 新功能从 feature 分支开发。
- 完成一个阶段后合并到 main。
- 不要长期堆一个巨大分支。

如果项目时间紧，也可以直接在 main 开发，但必须保持高质量提交记录。

---

## 17. 样式规范

### 17.1 UI 原则

项目 UI 以清晰、稳定、后台管理风格为主。

优先级：

1. 信息结构清楚
2. 操作路径明确
3. 状态反馈完整
4. 视觉干净统一
5. 动效适量

不要为了视觉效果牺牲开发进度。

### 17.2 组件库使用

优先使用 Ant Design 组件。

适合使用 Ant Design 的场景：

- Button
- Modal
- Drawer
- Form
- Table
- Tag
- Tabs
- Message
- Tooltip
- Dropdown

自定义组件主要用于业务封装，不要重复造基础组件。

### 17.3 状态展示

所有异步页面都要处理：

- loading
- error
- empty
- success

例如流程列表页必须处理：

- 加载中
- 加载失败
- 空列表
- 正常列表

---

## 18. 错误处理规范

### 18.1 前端错误处理

接口错误：

- 查询失败展示错误状态
- 提交失败使用 message 提示
- 运行失败展示具体错误原因

表单错误：

- 必填项明确提示
- URL 格式错误明确提示
- JSON 格式错误明确提示

画布错误：

- 非法连线要阻止，并给出提示
- 保存前校验流程完整性
- 执行前校验流程合法性

### 18.2 后端错误处理

后端错误响应应包含：

```ts
type ApiError = {
  message: string
  code?: string
  details?: unknown
}
```

不要只返回 500。

常见错误：

- workflow_not_found
- invalid_workflow_graph
- invalid_node_config
- node_execution_failed
- request_timeout

---

## 19. 环境变量规范

前端环境变量统一以 `VITE_` 开头。

示例：

```txt
VITE_API_BASE_URL=http://localhost:3000/api
```

不要把敏感信息写入前端环境变量。

`.env.example` 必须提交到仓库。

`.env.local` 不提交。

---

## 20. 测试规范

两个月项目周期内不要求大规模测试，但核心逻辑必须可测。

优先测试：

- 流程图合法性校验
- 是否存在环
- Start / End 节点规则
- Condition 分支选择
- workflow 与 React Flow 数据转换
- NodeExecutor 执行逻辑

测试文件命名：

```txt
xxx.test.ts
```

推荐测试目录跟随源码：

```txt
features/canvas/utils/validate-workflow.test.ts
features/execution/engine/condition-node.executor.test.ts
```

---

## 21. 文档规范

项目必须维护 README。

README 至少包含：

- 项目背景
- 项目功能
- 技术栈
- 系统架构
- 核心模块说明
- 流程执行机制
- 节点协议设计
- 本地启动方式
- 项目截图
- 演示地址
- 后续规划

开发过程中同步维护：

```txt
README.md
DEVELOPMENT_GUIDE.md
```

项目文档不是最后一天补的，而是边开发边沉淀。

---

## 22. 功能优先级规范

### 22.1 第一优先级

必须完成：

- 流程列表
- 流程编辑器
- 节点拖拽
- 节点连线
- 节点配置
- 流程保存
- 流程执行
- 节点运行状态
- 运行日志
- 两个业务模板

### 22.2 第二优先级

有时间再做：

- Transform 节点
- AI 节点
- 失败重试
- 流程版本管理
- 流程导入导出
- WebSocket / SSE 实时状态

### 22.3 暂不做

两个月内不做：

- 权限系统
- 多人协作
- 插件市场
- 复杂审批流
- 复杂报表
- 大规模监控系统

---

## 23. 每日开发规范

每天开发前先明确一个小目标。

推荐格式：

```txt
今天目标：完成 HTTP 节点配置表单
验收标准：可以填写 url、method、headers，并保存到节点 config
```

每天结束前记录：

```txt
今天完成：
遇到问题：
明天计划：
```

不要用“大目标”作为当天任务。

不推荐：

```txt
今天完成执行引擎
```

推荐：

```txt
今天完成 Start → HTTP → End 的顺序执行
```

---

## 24. 阶段验收标准

### 第 1 阶段：项目骨架

完成标准：

- React 项目能启动
- 路由搭好
- 基础布局完成
- Git 提交规范开始使用
- README 初版完成

### 第 2 阶段：画布编辑

完成标准：

- 可以拖拽节点
- 可以连接节点
- 可以删除节点和边
- 可以选中节点
- 可以打开配置面板

### 第 3 阶段：流程保存

完成标准：

- 可以创建流程
- 可以保存流程
- 可以加载流程
- 可以编辑已有流程
- 可以校验流程合法性

### 第 4 阶段：流程执行

完成标准：

- 可以点击运行
- 后端可以执行流程
- 节点状态可以记录
- 执行结果可以返回

### 第 5 阶段：运行日志

完成标准：

- 可以查看运行记录
- 可以查看运行详情
- 可以查看节点 input / output / error
- 失败节点能明确展示错误原因

### 第 6 阶段：项目包装

完成标准：

- 有业务模板
- 有 README
- 有架构图
- 有项目截图
- 有部署地址
- 有简历描述
- 有面试讲稿

---

## 25. 面试表达沉淀规范

每完成一个核心模块，都要同步记录它的面试说法。

例如完成执行引擎后，要记录：

- 为什么需要执行引擎
- 流程如何从画布数据转换成可执行结构
- 如何确定节点执行顺序
- Condition 节点如何选择分支
- 节点失败后如何处理
- 如何扩展新的节点类型

每个核心模块至少沉淀三个问题：

```txt
这个模块解决了什么问题？
核心技术点是什么？
如果继续优化，会怎么做？
```

---

## 26. 项目开发原则总结

1. 主链路优先，不做无关大功能。
2. 画布不是核心终点，能执行才是核心亮点。
3. Zustand 管客户端编辑态，TanStack Query 管服务端数据。
4. pages 只组装，features 承载业务能力。
5. shared 只放真正复用的基础能力。
6. 节点类型必须可扩展，不能到处散落 if else。
7. 运行日志必须做好，这是面试展示重点。
8. 每周都要有可演示成果。
9. 从第 6 周开始同步准备 README、简历和面试讲稿。
10. 不追求大而全，追求小而完整、有工程深度。

