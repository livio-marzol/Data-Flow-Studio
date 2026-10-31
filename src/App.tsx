import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  ReactFlowInstance,
  ReactFlowProvider,
  MarkerType
} from '@xyflow/react';

import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ResultPanel } from './components/ResultPanel';
import { InputNode } from './components/nodes/InputNode';
import { FilterNode } from './components/nodes/FilterNode';
import { SortNode } from './components/nodes/SortNode';
import { OutputNode } from './components/nodes/OutputNode';
import { CustomEdge } from './components/CustomEdge';

import {
  DataRow,
  PipelineNodeType,
  InputNodeData,
  FilterNodeData,
  SortNodeData,
  OutputNodeData
} from './types/pipeline';
import {
  getSampleSalesData,
  filterRows,
  sortRows,
  checkHasCycle,
  convertToCsvBlob,
  triggerDownload
} from './pipeline/engine';

// Node types mapping for React Flow
const nodeTypes = {
  inputNode: InputNode,
  filterNode: FilterNode,
  sortNode: SortNode,
  outputNode: OutputNode
};

// Edge types mapping
const edgeTypes = {
  customEdge: CustomEdge
};

// Initial default pipeline setup
function createInitialPipeline() {
  const sample = getSampleSalesData();

  const initialNodes: Node[] = [
    {
      id: 'node-input-1',
      type: 'inputNode',
      position: { x: 40, y: 150 },
      data: {
        label: 'Vendas Demo',
        filename: 'vendas_demo.csv',
        rawData: sample.data,
        columns: sample.columns,
        rowCount: sample.data.length
      } as InputNodeData
    },
    {
      id: 'node-filter-1',
      type: 'filterNode',
      position: { x: 340, y: 150 },
      data: {
        label: 'Peneira',
        column: 'valor',
        operator: 'gt',
        value: '300',
        columns: sample.columns,
        inputRowCount: sample.data.length,
        outputRowCount: sample.data.filter((r) => Number(r.valor) > 300).length
      } as FilterNodeData
    },
    {
      id: 'node-sort-1',
      type: 'sortNode',
      position: { x: 640, y: 150 },
      data: {
        label: 'Organizar',
        column: 'valor',
        direction: 'desc',
        columns: sample.columns,
        rowCount: sample.data.filter((r) => Number(r.valor) > 300).length
      } as SortNodeData
    },
    {
      id: 'node-output-1',
      type: 'outputNode',
      position: { x: 940, y: 150 },
      data: {
        label: 'Visualizar',
        viewMode: 'chart',
        xAxis: 'produto',
        yAxis: 'valor',
        columns: sample.columns,
        rowCount: sample.data.filter((r) => Number(r.valor) > 300).length
      } as OutputNodeData
    }
  ];

  const initialEdges: Edge[] = [
    {
      id: 'edge-1-2',
      source: 'node-input-1',
      target: 'node-filter-1',
      type: 'customEdge',
      data: { hasData: true },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#60d4ea' }
    },
    {
      id: 'edge-2-3',
      source: 'node-filter-1',
      target: 'node-sort-1',
      type: 'customEdge',
      data: { hasData: true },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#60d4ea' }
    },
    {
      id: 'edge-3-4',
      source: 'node-sort-1',
      target: 'node-output-1',
      type: 'customEdge',
      data: { hasData: true },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#60d4ea' }
    }
  ];

  return { initialNodes, initialEdges };
}

export function FlowCanvas() {
  const { initialNodes, initialEdges } = useMemo(() => createInitialPipeline(), []);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);

  // Right Result Panel state
  const [isResultPanelOpen, setIsResultPanelOpen] = useState(true);
  const [selectedNodeId, setSelectedNodeId] = useState<string>('node-output-1');



  // Node updater callback passed to node components
  const updateNodeData = useCallback((nodeId: string, partialData: any) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: { ...node.data, ...partialData }
          };
        }
        return node;
      })
    );
  }, [setNodes]);

  // Node delete callback
  const deleteNode = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((n) => n.id !== nodeId));
    setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
  }, [setNodes, setEdges]);

  // Open right panel and focus on given node
  const openPanelForNode = useCallback((nodeId: string) => {
    setSelectedNodeId(nodeId);
    setIsResultPanelOpen(true);
  }, []);

  // Validate connections: no cycles, only one incoming connection per target handle
  const isValidConnection = useCallback(
    (connection: Connection | Edge) => {
      if (!connection.source || !connection.target) return false;
      if (connection.source === connection.target) return false;

      // Cycle check
      const edgeList = edges.map((e) => ({ source: e.source, target: e.target }));
      if (checkHasCycle(connection.source, connection.target, edgeList)) {
        return false;
      }

      // Check if target already has an incoming edge
      const targetAlreadyConnected = edges.some((e) => e.target === connection.target);
      if (targetAlreadyConnected) {
        return false;
      }

      return true;
    },
    [edges]
  );

  const onConnect = useCallback(
    (params: Connection) => {
      if (!isValidConnection(params)) return;
      const newEdge: Edge = {
        ...params,
        id: `edge-${params.source}-${params.target}-${Date.now()}`,
        type: 'customEdge',
        data: { hasData: false },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#60d4ea' }
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [isValidConnection, setEdges]
  );

  // Pure topological evaluation of the pipeline
  const { computedOutputs, computedColumns, incomingMap } = useMemo(() => {
    const incoming = new Map<string, string>(); // targetId -> sourceId
    edges.forEach((edge) => {
      incoming.set(edge.target, edge.source);
    });

    const outputs: Record<string, DataRow[]> = {};
    const cols: Record<string, string[]> = {};

    const evaluateNode = (nodeId: string): DataRow[] => {
      if (outputs[nodeId]) return outputs[nodeId];

      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return [];

      let inputData: DataRow[] = [];
      const upstreamSourceId = incoming.get(nodeId);

      if (upstreamSourceId) {
        inputData = evaluateNode(upstreamSourceId);
      }

      let outputData: DataRow[] = [];
      let currentCols: string[] = [];

      switch (node.type) {
        case 'inputNode': {
          outputData = (node.data as unknown as InputNodeData).rawData || [];
          currentCols = (node.data as unknown as InputNodeData).columns || (outputData.length > 0 ? Object.keys(outputData[0]) : []);
          break;
        }

        case 'filterNode': {
          const filterData = node.data as unknown as FilterNodeData;
          currentCols = inputData.length > 0 ? Object.keys(inputData[0]) : [];
          outputData = filterRows(
            inputData,
            filterData.column,
            filterData.operator,
            filterData.value
          );
          break;
        }

        case 'sortNode': {
          const sortData = node.data as unknown as SortNodeData;
          currentCols = inputData.length > 0 ? Object.keys(inputData[0]) : [];
          outputData = sortRows(inputData, sortData.column, sortData.direction);
          break;
        }

        case 'outputNode': {
          outputData = inputData;
          currentCols = inputData.length > 0 ? Object.keys(inputData[0]) : [];
          break;
        }

        default:
          outputData = inputData;
          currentCols = inputData.length > 0 ? Object.keys(inputData[0]) : [];
      }

      outputs[nodeId] = outputData;
      cols[nodeId] = currentCols;
      return outputData;
    };

    nodes.forEach((node) => {
      evaluateNode(node.id);
    });

    return { computedOutputs: outputs, computedColumns: cols, incomingMap: incoming };
  }, [nodes, edges]);

  // Inject computed data & callbacks into node objects cleanly
  const augmentedNodes = useMemo(() => {
    return nodes.map((node) => {
      const out = computedOutputs[node.id] || [];
      const cols = computedColumns[node.id] || [];
      const upstreamSourceId = incomingMap.get(node.id);
      const inRows = upstreamSourceId ? (computedOutputs[upstreamSourceId] || []).length : undefined;

      return {
        ...node,
        data: {
          ...node.data,
          columns: cols,
          rowCount: out.length,
          inputRowCount: inRows,
          outputRowCount: out.length,
          onUpdateData: updateNodeData,
          onDeleteNode: deleteNode,
          onOpenPanel: openPanelForNode
        }
      };
    });
  }, [nodes, computedOutputs, computedColumns, incomingMap, updateNodeData, deleteNode, openPanelForNode]);

  // Inject active data state into edges
  const augmentedEdges = useMemo(() => {
    return edges.map((edge) => {
      const sourceData = computedOutputs[edge.source] || [];
      const hasData = sourceData.length > 0;
      return {
        ...edge,
        data: { ...edge.data, hasData }
      };
    });
  }, [edges, computedOutputs]);

  // Add node handler (from sidebar click or drop)
  const addNode = useCallback(
    (type: PipelineNodeType, position?: { x: number; y: number }) => {
      const id = `node-${type}-${Date.now()}`;
      const defaultPos = position || {
        x: 100 + (nodes.length % 5) * 60,
        y: 120 + (nodes.length % 5) * 60
      };

      let initialData: any = { label: 'Novo Bloco' };

      if (type === 'inputNode') {
        const sample = getSampleSalesData();
        initialData = {
          label: 'Subir Arquivo',
          rawData: sample.data,
          columns: sample.columns,
          rowCount: sample.data.length
        };
      } else if (type === 'filterNode') {
        initialData = {
          label: 'Peneira',
          column: '',
          operator: 'gt',
          value: '',
          columns: []
        };
      } else if (type === 'sortNode') {
        initialData = {
          label: 'Organizar',
          column: '',
          direction: 'asc',
          columns: []
        };
      } else if (type === 'outputNode') {
        initialData = {
          label: 'Visualizar',
          viewMode: 'table',
          xAxis: '',
          yAxis: '',
          columns: []
        };
      }

      const newNode: Node = {
        id,
        type,
        position: defaultPos,
        data: initialData
      };

      setNodes((nds) => [...nds, newNode]);
      setSelectedNodeId(id);
    },
    [nodes.length, setNodes]
  );

  // Drag and drop onto canvas
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow') as PipelineNodeType;
      if (!type || !reactFlowInstance) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY
      });

      addNode(type, position);
    },
    [reactFlowInstance, addNode]
  );

  // Header actions
  const handleLoadExample = useCallback(() => {
    const { initialNodes: newNodes, initialEdges: newEdges } = createInitialPipeline();
    setNodes(newNodes);
    setEdges(newEdges);
    setSelectedNodeId('node-output-1');
    setIsResultPanelOpen(true);
  }, [setNodes, setEdges]);

  const handleClearCanvas = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setSelectedNodeId('');
  }, [setNodes, setEdges]);

  // Active data for right panel
  const activeNode = useMemo(() => {
    if (selectedNodeId) {
      const found = nodes.find((n) => n.id === selectedNodeId);
      if (found) return found;
    }
    // Fallback: last output node or last node
    const lastOutput = [...nodes].reverse().find((n) => n.type === 'outputNode');
    if (lastOutput) return lastOutput;
    return nodes[nodes.length - 1];
  }, [nodes, selectedNodeId]);

  const activeData = useMemo(() => {
    if (!activeNode) return [];
    return computedOutputs[activeNode.id] || [];
  }, [activeNode, computedOutputs]);

  const activeColumns = useMemo(() => {
    if (!activeNode) return [];
    return computedColumns[activeNode.id] || [];
  }, [activeNode, computedColumns]);

  const handleExportCsv = useCallback(() => {
    if (activeData.length === 0) return;
    const blob = convertToCsvBlob(activeData);
    const filename = `dataflow_${activeNode?.data?.label || 'export'}_${Date.now()}.csv`;
    triggerDownload(blob, filename);
  }, [activeData, activeNode]);

  return (
    <div className="flex flex-col h-screen w-screen bg-[#020202] text-white overflow-hidden font-sans">
      {/* Top Header */}
      <Header
        onLoadExample={handleLoadExample}
        onClearCanvas={handleClearCanvas}
        onExportCsv={handleExportCsv}
        hasExportData={activeData.length > 0}
      />

      {/* Main Workspace Area */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Sidebar */}
        <Sidebar onAddNode={(type) => addNode(type)} />

        {/* Central Canvas */}
        <div
          className="flex-1 h-full relative"
          onDragOver={onDragOver}
          onDrop={onDrop}
        >
          <ReactFlow
            nodes={augmentedNodes}
            edges={augmentedEdges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onNodeClick={(_, node) => setSelectedNodeId(node.id)}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView
            fitViewOptions={{ padding: 0.08, minZoom: 0.6, maxZoom: 1.1 }}
            minZoom={0.2}
            maxZoom={2}
            defaultEdgeOptions={{
              type: 'customEdge'
            }}
          >
            <Background
              color="#373739"
              gap={20}
              size={1.5}
            />
            <Controls showInteractive={false} />
          </ReactFlow>
        </div>

        {/* Right Result Panel */}
        <ResultPanel
          data={activeData}
          columns={activeColumns}
          activeNodeTitle={activeNode?.data?.label ? String(activeNode.data.label) : 'Resultado'}
          isOpen={isResultPanelOpen}
          onToggle={() => setIsResultPanelOpen(!isResultPanelOpen)}
          initialTab={
            activeNode?.type === 'outputNode' && (activeNode.data as OutputNodeData).viewMode === 'chart'
              ? 'chart'
              : 'table'
          }
          defaultXAxis={
            activeNode?.type === 'outputNode'
              ? (activeNode.data as OutputNodeData).xAxis
              : undefined
          }
          defaultYAxis={
            activeNode?.type === 'outputNode'
              ? (activeNode.data as OutputNodeData).yAxis
              : undefined
          }
        />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ReactFlowProvider>
      <FlowCanvas />
    </ReactFlowProvider>
  );
}
