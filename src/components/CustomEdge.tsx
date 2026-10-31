import React from 'react';
import { BaseEdge, EdgeProps, getBezierPath } from '@xyflow/react';

export const CustomEdge: React.FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data
}) => {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition
  });

  const hasData = data && (data as any).hasData;

  return (
    <>
      {/* Background glow or thicker hover line */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={14}
        className="cursor-pointer"
      />
      {/* Main Connection Line */}
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        className={hasData ? 'animated-active-edge' : ''}
        style={{
          ...style,
          stroke: hasData ? '#60d4ea' : '#373739',
          strokeWidth: 2,
          transition: 'stroke 0.2s ease, stroke-width 0.2s ease'
        }}
      />
    </>
  );
};
