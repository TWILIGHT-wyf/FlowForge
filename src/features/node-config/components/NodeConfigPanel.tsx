import { Empty, Input, Typography } from "antd";
import { useWorkflowEditorStore } from "@/features/canvas/stores/workflow-editor-store";

export default function NodeConfigPanel() {
  const nodes = useWorkflowEditorStore((state) => state.nodes);
  const selectedNodeId = useWorkflowEditorStore(
    (state) => state.selectedNodeId,
  );
  const updateNodeLabel = useWorkflowEditorStore(
    (state) => state.updateNodeLabel,
  );

  const selectedNode = nodes.find((node) => node.id === selectedNodeId);

  return (
    <aside
      style={{
        width: 360,
        flexShrink: 0,
        padding: 16,
        borderLeft: "1px solid #eee",
        background: "#fff",
        overflowY: "auto",
      }}
    >
      <h3 style={{ marginTop: 0 }}>节点配置</h3>

      {!selectedNode && (
        <Empty description="请选择一个节点" style={{ marginTop: 80 }} />
      )}

      {selectedNode && (
        <div>
          <Typography.Text type="secondary">节点 ID</Typography.Text>
          <div style={{ marginBottom: 16 }}>{selectedNode.id}</div>

          <Typography.Text type="secondary">节点类型</Typography.Text>
          <div style={{ marginBottom: 16 }}>{selectedNode.data.nodeType}</div>

          <Typography.Text type="secondary">节点名称</Typography.Text>
          <Input
            style={{ marginTop: 8 }}
            value={selectedNode.data.label}
            onChange={(event) => {
              updateNodeLabel(selectedNode.id, event.target.value);
            }}
          />
        </div>
      )}
    </aside>
  );
}
