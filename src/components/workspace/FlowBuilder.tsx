'use client'

import { useCallback, useMemo } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  ConnectionMode,
  MarkerType,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import type { CustomerJourney, JourneyStage } from '@/types'

interface FlowBuilderProps {
  customerJourney: CustomerJourney
}

// Custom node component for journey stages
function JourneyNode({ data }: { data: { label: string; description: string; touchpoints: string[]; isStart?: boolean; isEnd?: boolean } }) {
  const isSpecial = data.isStart || data.isEnd

  return (
    <div
      className={`px-4 py-3 rounded-lg shadow-lg min-w-[180px] ${
        isSpecial
          ? 'bg-white border-2 border-gray-200'
          : 'bg-[#2a2a2a] border border-[#3a3a3a]'
      }`}
    >
      <div className="flex items-center gap-2 mb-1">
        {data.isStart && (
          <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
          </div>
        )}
        {data.isEnd && (
          <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
            </svg>
          </div>
        )}
        <span className={`font-semibold text-sm ${isSpecial ? 'text-gray-900' : 'text-white'}`}>
          {data.label}
        </span>
      </div>
      <p className={`text-xs ${isSpecial ? 'text-gray-500' : 'text-gray-400'} line-clamp-2`}>
        {data.description}
      </p>
      {data.touchpoints && data.touchpoints.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {data.touchpoints.slice(0, 2).map((tp, i) => (
            <span
              key={i}
              className={`text-[10px] px-1.5 py-0.5 rounded ${
                isSpecial ? 'bg-gray-100 text-gray-600' : 'bg-[#3a3a3a] text-gray-300'
              }`}
            >
              {tp}
            </span>
          ))}
          {data.touchpoints.length > 2 && (
            <span className={`text-[10px] ${isSpecial ? 'text-gray-400' : 'text-gray-500'}`}>
              +{data.touchpoints.length - 2}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

const nodeTypes = {
  journey: JourneyNode,
}

export function FlowBuilder({ customerJourney }: FlowBuilderProps) {
  const stages = customerJourney.stages || []

  // Generate nodes from stages
  const initialNodes = useMemo(() => {
    const nodes: Node[] = []

    // Create start node
    nodes.push({
      id: 'start',
      type: 'journey',
      position: { x: 0, y: 150 },
      data: {
        label: 'Start',
        description: 'Customer enters journey',
        touchpoints: [],
        isStart: true,
      },
    })

    // Create stage nodes in a flowing layout
    stages.forEach((stage: JourneyStage, index: number) => {
      // Alternate row positions for visual interest
      const row = index < 4 ? 0 : 1
      const col = index < 4 ? index : 7 - index // Reverse direction for second row

      nodes.push({
        id: `stage-${index}`,
        type: 'journey',
        position: {
          x: 200 + col * 250,
          y: row === 0 ? 150 : 350,
        },
        data: {
          label: stage.name,
          description: stage.description,
          touchpoints: stage.touchpoints || [],
        },
      })
    })

    // Create end node
    const lastStageIndex = stages.length - 1
    const endRow = lastStageIndex < 4 ? 0 : 1

    nodes.push({
      id: 'end',
      type: 'journey',
      position: {
        x: endRow === 0 ? 200 + (lastStageIndex + 1) * 250 : 200,
        y: endRow === 0 ? 150 : 350,
      },
      data: {
        label: 'End',
        description: 'Journey complete',
        touchpoints: [],
        isEnd: true,
      },
    })

    return nodes
  }, [stages])

  // Generate edges connecting nodes
  const initialEdges = useMemo(() => {
    const edges: Edge[] = []

    // Connect start to first stage
    if (stages.length > 0) {
      edges.push({
        id: 'start-to-stage-0',
        source: 'start',
        target: 'stage-0',
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#3b82f6', strokeWidth: 2, strokeDasharray: '5,5' },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' },
      })
    }

    // Connect stages sequentially
    stages.forEach((_: JourneyStage, index: number) => {
      const nextIndex = index + 1

      if (nextIndex < stages.length) {
        edges.push({
          id: `stage-${index}-to-stage-${nextIndex}`,
          source: `stage-${index}`,
          target: `stage-${nextIndex}`,
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#3b82f6', strokeWidth: 2, strokeDasharray: '5,5' },
          markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' },
        })
      } else {
        // Last stage connects to end
        edges.push({
          id: `stage-${index}-to-end`,
          source: `stage-${index}`,
          target: 'end',
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#3b82f6', strokeWidth: 2, strokeDasharray: '5,5' },
          markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' },
        })
      }
    })

    return edges
  }, [stages])

  const [nodes, , onNodesChange] = useNodesState(initialNodes)
  const [edges, , onEdgesChange] = useEdgesState(initialEdges)

  const onInit = useCallback(() => {
    // Flow initialized
  }, [])

  if (stages.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-[#1a1a1a] text-gray-400">
        No customer journey data available
      </div>
    )
  }

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onInit={onInit}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.3}
        maxZoom={1.5}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#333" gap={20} size={1} />
        <Controls className="bg-[#2a2a2a] border-[#3a3a3a]" />
      </ReactFlow>
    </div>
  )
}
