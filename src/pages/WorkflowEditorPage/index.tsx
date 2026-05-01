import { useParams } from "react-router-dom";

export default function WorkflowEditorPage() {
  const { workflowId } = useParams();

  const isCreateMode = workflowId === undefined;

  return (
    <div style={{ padding: 24 }}>
      <h1>{isCreateMode ? "新建流程" : "编辑流程"}</h1>
      <p>workflowId: {workflowId ?? "暂无，新建模式"}</p>
    </div>
  );
}
