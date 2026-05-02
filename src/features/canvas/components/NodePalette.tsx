import { Card } from "antd";

const nodeItems = [
  {
    title: "Start 节点",
    description: "流程开始位置",
  },
  {
    title: "HTTP 请求节点",
    description: "调用接口并返回数据",
  },
  {
    title: "条件判断节点",
    description: "根据条件选择分支",
  },
  {
    title: "End 节点",
    description: "流程结束位置",
  },
];

export default function NodePalette() {
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
          key={item.title}
          size="small"
          style={{
            marginBottom: 12,
            cursor: "grab",
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
