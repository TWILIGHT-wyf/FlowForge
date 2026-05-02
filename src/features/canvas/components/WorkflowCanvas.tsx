import { Background, Controls, MiniMap, ReactFlow } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { useWorkflowEditorStore } from "../stores/workflow-editor-store";

export default function WorkflowCanvas() {
  const nodes = useWorkflowEditorStore((state) => state.nodes);
  const edges = useWorkflowEditorStore((state) => state.edges);
  const selectedNodeId = useWorkflowEditorStore(
    (state) => state.selectedNodeId,
  );

  const onNodesChange = useWorkflowEditorStore((state) => state.onNodesChange);
  const onEdgesChange = useWorkflowEditorStore((state) => state.onEdgesChange);
  const onConnect = useWorkflowEditorStore((state) => state.onConnect);
  const selectNode = useWorkflowEditorStore((state) => state.selectNode);

  return (
    <div style={{ flex: 1, height: "100%" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={(_, node) => {
          selectNode(node.id);
        }}
        onPaneClick={() => {
          selectNode(undefined);
        }}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>

      <div
        style={{
          position: "absolute",
          right: 16,
          bottom: 16,
          padding: "8px 12px",
          borderRadius: 8,
          background: "#fff",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.12)",
          fontSize: 12,
        }}
      >
        当前选中节点：{selectedNodeId ?? "暂无"}
      </div>
    </div>
  );
}
