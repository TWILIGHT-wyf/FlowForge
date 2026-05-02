import type { Node } from "@xyflow/react";

export type WorkflowNodeType = "start" | "http" | "condition" | "end";

export type WorkflowNodeData = {
  label: string;
  nodeType: WorkflowNodeType;
};

export type WorkflowFlowNode = Node<WorkflowNodeData>;
