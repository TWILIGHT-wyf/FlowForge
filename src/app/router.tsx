import { createBrowserRouter, Navigate } from "react-router-dom";
import App from "@/App";
import WorkflowListPage from "@/pages/WorkflowListPage";
import WorkflowEditorPage from "@/pages/WorkflowEditorPage";
import RunListPage from "@/pages/RunListPage";
import RunDetailPage from "@/pages/RunDetailPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <Navigate to="/workflows" replace />,
      },
      {
        path: "workflows",
        element: <WorkflowListPage />,
      },
      {
        path: "workflows/new",
        element: <WorkflowEditorPage />,
      },
      {
        path: "workflows/:workflowId/edit",
        element: <WorkflowEditorPage />,
      },
      {
        path: "runs",
        element: <RunListPage />,
      },
      {
        path: "runs/:runId",
        element: <RunDetailPage />,
      },
    ],
  },
]);
