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
import type { WorkflowFlowNode } from "../types/workflow-node";

type WorkflowEditorState = {
  nodes: WorkflowFlowNode[];
  edges: Edge[];
  selectedNodeId?: string;

  onNodesChange: (changes: NodeChange<WorkflowFlowNode>[]) => void;
  onEdgesChange: (changes: EdgeChange<Edge>[]) => void;
  onConnect: (connection: Connection) => void;
  selectNode: (nodeId?: string) => void;
};

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
      set({
        edges: addEdge(connection, get().edges),
      });
    },

    selectNode: (nodeId) => {
      set({
        selectedNodeId: nodeId,
      });
    },
  }),
);