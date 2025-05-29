import { RouteFlow } from '../routes/route.interface';

export function convertRawToRouteContent(raw: {
  nodes: any[];
  edges: any[];
}): RouteFlow {
  const { nodes, edges } = raw;

  const cleanedNodes = nodes.map((node) => ({
    id: node.id,
    data: {
      label: node.data?.label || '',
      prompt: node.data?.prompt || '',
      agent: node.data?.agent || '',
      model: node.data?.model || '',
      tools: node.data?.tools || [],
      isStart: !!node.data?.isStart,
    },
  }));

  const cleanedEdges = edges.map((edge) => ({
    source: edge.source,
    target: edge.target,
  }));

  return {
    nodes: cleanedNodes,
    edges: cleanedEdges,
  };
}
