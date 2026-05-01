import { Button } from 'antd'
import { useNavigate } from 'react-router-dom'

export default function WorkflowListPage() {
  const navigate = useNavigate()
  return (
    <div style={{ padding: 24 }}>
      <h1>FlowForge</h1>
      <p>通用工作流编排与执行平台</p>
      <Button type="primary" onClick={() => navigate('/workflows/new')}>
        新建流程
      </Button>
    </div>
  )
}