import { Card } from "antd";
import { useWorkflowEditorStore } from "@/features/canvas/stores/workflow-editor-store";
import type { WorkflowNodeType } from "@/features/canvas/types/workflow-node";

type NodePaletteItem = {
  nodeType: WorkflowNodeType;
  title: string;
  description: string;
};

const nodeItems: NodePaletteItem[] = [
  {
    nodeType: "start",
    title: "Start 节点",
    description: "流程开始位置",
  },
  {
    nodeType: "http",
    title: "HTTP 请求节点",
    description: "调用接口并返回数据",
  },
  {
    nodeType: "condition",
    title: "条件判断节点",
    description: "根据条件选择分支",
  },
  {
    nodeType: "end",
    title: "End 节点",
    description: "流程结束位置",
  },
];

export default function NodePalette() {
  const addNode = useWorkflowEditorStore((state) => state.addNode);

  return (
    <aside
      style={{
        width: 240,
        padding: 16,
        borderRight: "1px solid #eee",
        background: "#fff",
      }}
    >
      <h3 style={{ marginTop: 0 }}>节点面板</h3>

      {nodeItems.map((item) => (
        <Card
          key={item.nodeType}
          size="small"
          onClick={() => addNode(item.nodeType)}
          style={{
            marginBottom: 12,
            cursor: "pointer",
          }}
        >
          <strong>{item.title}</strong>
          <div style={{ marginTop: 4, color: "#666", fontSize: 12 }}>
            {item.description}
          </div>
        </Card>
      ))}
    </aside>
  );
}
