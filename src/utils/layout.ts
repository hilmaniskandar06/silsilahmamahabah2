import dagre from 'dagre';
import { Node, Edge } from '@xyflow/react';
import { Person } from '@/types/family';

const nodeWidth = 160; 
const nodeHeight = 160;
const partnerSpacing = 40; // Spacing between blood node and partner(s)

export const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  // Increased ranksep and nodesep to minimize edge overlap
  dagreGraph.setGraph({ rankdir: direction, ranksep: 120, nodesep: 100 });

  // 1. Identify Blood Nodes and Partner Nodes
  const bloodNodes = nodes.filter(n => {
    const p = n.data as unknown as Person;
    return p.relationType === 'blood';
  });
  
  const partnerNodes = nodes.filter(n => {
    const p = n.data as unknown as Person;
    return p.relationType === 'partner';
  });

  // 2. Map partners to their blood parents based on edges
  // The edge is typically Blood -> Partner
  const partnerToBloodMap = new Map<string, string>();
  edges.forEach(e => {
    const sourceIsBlood = bloodNodes.some(b => b.id === e.source);
    const targetIsPartner = partnerNodes.some(p => p.id === e.target);
    if (sourceIsBlood && targetIsPartner) {
      partnerToBloodMap.set(e.target, e.source);
    }
  });

  // 3. Group into Families (Blood node + its partners)
  const families = new Map<string, Node[]>();
  
  // Initialize families with blood nodes
  bloodNodes.forEach(b => families.set(b.id, [b]));
  
  // Add partners to their respective families
  partnerNodes.forEach(p => {
    const bloodId = partnerToBloodMap.get(p.id);
    if (bloodId && families.has(bloodId)) {
      families.get(bloodId)!.push(p);
    } else {
      // If a partner has no blood link (orphan), treat as its own family
      families.set(p.id, [p]);
    }
  });

  // 4. Add Family Nodes to Dagre
  families.forEach((members, familyId) => {
    const totalWidth = members.length * nodeWidth + (members.length - 1) * partnerSpacing;
    dagreGraph.setNode(familyId, { width: totalWidth, height: nodeHeight });
  });

  // 5. Add Edges between Families (ignoring Blood->Partner edges within the same family)
  const familyEdges = new Set<string>();
  edges.forEach(e => {
    const sourceFamilyId = partnerToBloodMap.get(e.source) || e.source;
    const targetFamilyId = partnerToBloodMap.get(e.target) || e.target;
    
    if (sourceFamilyId !== targetFamilyId) {
      const edgeKey = `${sourceFamilyId}->${targetFamilyId}`;
      if (!familyEdges.has(edgeKey)) {
        familyEdges.add(edgeKey);
        dagreGraph.setEdge(sourceFamilyId, targetFamilyId);
      }
    }
  });

  // 6. Run Layout
  dagre.layout(dagreGraph);

  // 7. Unpack Families back into individual nodes
  const newNodes: Node[] = [];
  
  families.forEach((members, familyId) => {
    const familyPos = dagreGraph.node(familyId);
    if (!familyPos) return; // safety check
    
    const totalWidth = members.length * nodeWidth + (members.length - 1) * partnerSpacing;
    // familyPos.x is the center. Start from the left edge of the bounding box.
    let currentX = familyPos.x - totalWidth / 2 + nodeWidth / 2;
    
    members.forEach(member => {
      newNodes.push({
        ...member,
        position: {
          x: currentX - nodeWidth / 2, // React Flow top-left anchor
          y: familyPos.y - nodeHeight / 2,
        }
      });
      currentX += nodeWidth + partnerSpacing;
    });
  });

  // Return the unpacked nodes and original edges
  return { nodes: newNodes, edges };
};
