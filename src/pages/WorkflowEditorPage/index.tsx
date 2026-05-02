import NodePalette from "@/features/canvas/components/NodePalette";
import WorkflowCanvas from "@/features/canvas/components/WorkflowCanvas";
import NodeConfigPanel from "@/features/node-config/components/NodeConfigPanel";
import { useParams } from "react-router-dom";

export default function WorkflowEditorPage() {
  const { workflowId } = useParams();
  const isCreateMode = workflowId === undefined;

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "#f5f5f5",
      }}
    >
      <header
        style={{
          height: 56,
          padding: "0 16px",
          display: "flex",
          alignItems: "center",
          borderBottom: "1px solid #eee",
          background: "#fff",
        }}
      >
        <strong>{isCreateMode ? "新建流程" : "编辑流程"}</strong>

        {!isCreateMode && (
          <span style={{ marginLeft: 12, color: "#999" }}>
            workflowId: {workflowId}
          </span>
        )}
      </header>

      <main
        style={{
          flex: 1,
          display: "flex",
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        <NodePalette />
        <WorkflowCanvas />
        <NodeConfigPanel />
      </main>
    </div>
  );
}
