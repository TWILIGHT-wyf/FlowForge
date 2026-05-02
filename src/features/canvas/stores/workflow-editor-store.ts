import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
  type Edge,
  type EdgeChange,
  type NodeChange,
} from "@xyflow/react";
import { create } from "zustand";
import type {
  WorkflowFlowNode,
  WorkflowNodeType,
} from "../types/workflow-node";
import { createId } from "@/shared/utils/id";
// 状态
type WorkflowEditorState = {
  nodes: WorkflowFlowNode[];
  edges: Edge[];
  selectedNodeId?: string;

  onNodesChange: (changes: NodeChange<WorkflowFlowNode>[]) => void;
  onEdgesChange: (changes: EdgeChange<Edge>[]) => void;
  onConnect: (connection: Connection) => void;
  selectNode: (nodeId?: string) => void;
  updateNodeLabel: (nodeId: string, label: string) => void;
  addNode: (nodeType: WorkflowNodeType) => void;
};

// TODO 后续从接口或本地草稿中恢复数据
const initialNodes: WorkflowFlowNode[] = [
  {
    id: "start-1",
    type: "input",
    position: { x: 120, y: 180 },
    data: {
      label: "Start",
      nodeType: "start",
    },
  },
  {
    id: "end-1",
    type: "output",
    position: { x: 520, y: 180 },
    data: {
      label: "End",
      nodeType: "end",
    },
  },
];

const initialEdges: Edge[] = [
  {
    id: "edge-start-end",
    source: "start-1",
    target: "end-1",
  },
];

// 创建节点
function createWorkflowFlowNode(
  nodeType: WorkflowNodeType,
  index: number,
): WorkflowFlowNode {
  const id = createId(nodeType);

  return {
    id,
    type: FLOW_NODE_TYPE_MAP[nodeType],
    // TODO: 后续根据当前画布视口中心或拖拽释放位置生成节点坐标。
    position: { x: 260 + index * 40, y: 160 + index * 30 },
    data: {
      label: NODE_LABEL_MAP[nodeType],
      nodeType,
    },
  };
}

// 连线校验
function canConnect(
  connection: Connection,
  nodes: WorkflowFlowNode[],
  edges: Edge[],
) {
  if (!connection.source || !connection.target) {
    return false;
  }

  if (connection.source === connection.target) {
    return false;
  }

  const sourceNode = nodes.find((node) => node.id === connection.source);
  const targetNode = nodes.find((node) => node.id === connection.target);

  if (!sourceNode || !targetNode) {
    return false;
  }

  if (sourceNode.data.nodeType === "end") {
    return false;
  }

  if (targetNode.data.nodeType === "start") {
    return false;
  }

  const alreadyConnected = edges.some(
    (edge) =>
      edge.source === connection.source && edge.target === connection.target,
  );

  if (alreadyConnected) {
    return false;
  }

  return true;
}

// TODO 节点标签映射（待扩展）
const NODE_LABEL_MAP = {
  start: "Start",
  http: "HTTP Request",
  condition: "Condition",
  end: "End",
} satisfies Record<WorkflowNodeType, string>;

// TODO ReactFlow节点渲染类型映射（待扩展）
const FLOW_NODE_TYPE_MAP = {
  start: "input",
  http: "default",
  condition: "default",
  end: "output",
} satisfies Record<WorkflowNodeType, "input" | "default" | "output">;

export const useWorkflowEditorStore = create<WorkflowEditorState>(
  (set, get) => ({
    nodes: initialNodes,
    edges: initialEdges,
    selectedNodeId: undefined,

    onNodesChange: (changes) => {
      set({
        nodes: applyNodeChanges(changes, get().nodes),
      });
    },

    onEdgesChange: (changes) => {
      set({
        edges: applyEdgeChanges(changes, get().edges),
      });
    },

    onConnect: (connection) => {
      const nodes = get().nodes;
      const edges = get().edges;

      if (!canConnect(connection, nodes, edges)) {
        return;
      }

      set({
        edges: addEdge(connection, edges),
      });
    },

    selectNode: (nodeId) => {
      set({
        selectedNodeId: nodeId,
      });
    },

    updateNodeLabel: (nodeId, label) => {
      set((state) => ({
        nodes: state.nodes.map((node) =>
          node.id === nodeId
            ? {
                ...node,
                data: {
                  ...node.data,
                  label,
                },
              }
            : node,
        ),
      }));
    },
    addNode: (nodeType) => {
      const node = createWorkflowFlowNode(nodeType, get().nodes.length);

      set((state) => ({
        nodes: [...state.nodes, node],
        selectedNodeId: node.id,
      }));
    },
  }),
);
