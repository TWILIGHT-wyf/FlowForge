// TODO: 后续接入后端后，节点 ID 生成策略需要与服务端保持一致。
export function createId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}
