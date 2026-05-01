import { useParams } from "react-router-dom";

export default function RunDetailPage() {
  const { runId } = useParams();

  return (
    <div style={{ padding: 24 }}>
      <h1>运行详情</h1>
      <p>runId: {runId}</p>
    </div>
  );
}
