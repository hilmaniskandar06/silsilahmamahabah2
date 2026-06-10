import React from 'react';
import { BaseEdge, EdgeProps, getSmoothStepPath, getStraightPath } from '@xyflow/react';

export function CustomEdge({
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
}: EdgeProps) {
  const isPartner = data?.isPartner as boolean;
  
  let edgePath = '';
  if (isPartner) {
    [edgePath] = getStraightPath({
      sourceX,
      sourceY,
      targetX,
      targetY,
    });
  } else {
    [edgePath] = getSmoothStepPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
      borderRadius: 16 // Smooth angles
    });
  }

  // Dynamic colors based on data or default
  const strokeColor = data?.color ? (data.color as string) : '#94a3b8'; // default gray

  return (
    <BaseEdge 
      id={id} 
      path={edgePath} 
      markerEnd={markerEnd} 
      style={{
        ...style,
        strokeWidth: 4, // TEBAL
        stroke: strokeColor
      }}
    />
  );
}
