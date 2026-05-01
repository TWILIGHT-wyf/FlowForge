import { Link, Outlet } from "react-router-dom";

function App() {
  return (
    <div>
      <header style={{ padding: 16, borderBottom: "1px solid #eee" }}>
        <strong>FlowForge</strong>

        <nav style={{ display: "inline-flex", gap: 16, marginLeft: 24 }}>
          <Link to="/workflows">流程列表</Link>
          <Link to="/runs">运行记录</Link>
        </nav>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default App;
