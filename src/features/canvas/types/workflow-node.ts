import type { Node } from "@xyflow/react";

// TODO 待扩展
export type WorkflowNodeType = "start" | "http" | "condition" | "end";

// 节点业务数据类型
export type WorkflowNodeData = {
  label: string;
  nodeType: WorkflowNodeType;
};

// React Flow 用于画布渲染的节点结构。
// 后续保存或执行前，需要转换成平台自己的 WorkflowNode 定义。
export type WorkflowFlowNode = Node<WorkflowNodeData>;
