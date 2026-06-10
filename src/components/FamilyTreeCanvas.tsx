'use client';

import React, { useCallback, useState, useEffect, useRef } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  Panel,
  useReactFlow,
  ReactFlowProvider,
  Node,
  Edge
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Search, Lock, Moon, Download, Focus, CloudUpload, BarChart2 } from 'lucide-react';
import { toPng } from 'html-to-image';
import { supabase } from '@/lib/supabase';

import { PersonNode } from './nodes/PersonNode';
import { CustomEdge } from './edges/CustomEdge';
import { getLayoutedElements } from '@/utils/layout';
import { Person } from '@/types/family';
import { BiodataPanel } from './ui/BiodataPanel';
import { EditModal } from './ui/EditModal';

const nodeTypes = {
  person: PersonNode,
};

const edgeTypes = {
  custom: CustomEdge,
};

const edgeColors = ['#f43f5e', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#14b8a6'];
const getRandomEdgeColor = () => edgeColors[Math.floor(Math.random() * edgeColors.length)];

// Mock data to show the layout working
const initialNodes: Node[] = [
  { id: '1', type: 'person', data: { id: '1', name: 'Kakek', gender: 'male', relationType: 'blood' }, position: { x: 0, y: 0 } },
  { id: '2', type: 'person', data: { id: '2', name: 'Nenek', gender: 'female', relationType: 'partner' }, position: { x: 0, y: 0 } },
  { id: '3', type: 'person', data: { id: '3', name: 'Ayah', gender: 'male', relationType: 'blood' }, position: { x: 0, y: 0 } },
  { id: '4', type: 'person', data: { id: '4', name: 'Ibu', gender: 'female', relationType: 'partner' }, position: { x: 0, y: 0 } },
  { id: '5', type: 'person', data: { id: '5', name: 'Anak', gender: 'male', relationType: 'blood' }, position: { x: 0, y: 0 } },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', sourceHandle: 'right', target: '2', targetHandle: 'left', type: 'custom', data: { color: getRandomEdgeColor(), isPartner: true } },
  { id: 'e1-3', source: '1', sourceHandle: 'bottom', target: '3', targetHandle: 'top', type: 'custom', data: { color: getRandomEdgeColor() } },
  { id: 'e3-4', source: '3', sourceHandle: 'right', target: '4', targetHandle: 'left', type: 'custom', data: { color: getRandomEdgeColor(), isPartner: true } },
  { id: 'e3-5', source: '3', sourceHandle: 'bottom', target: '5', targetHandle: 'top', type: 'custom', data: { color: getRandomEdgeColor() } },
];

function FlowCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const { fitView } = useReactFlow();

  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [isBiodataOpen, setIsBiodataOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isDbLoading, setIsDbLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);
  
  const toggleAdmin = () => {
    if (!isAdmin) {
      const pwd = window.prompt("Masukkan password admin:");
      if (pwd === "hilman123456") {
        setIsAdmin(true);
      } else if (pwd !== null) {
        alert("Password salah!");
      }
    } else {
      setIsAdmin(false);
    }
  };
  const handleSearch = () => {
    const term = window.prompt('Masukkan nama anggota keluarga yang dicari:');
    if (!term) return;
    
    const foundNode = nodes.find(n => {
      const p = n.data as unknown as Person;
      return p.name.toLowerCase().includes(term.toLowerCase());
    });

    if (foundNode) {
      setSelectedPerson(foundNode.data as unknown as Person);
      setIsBiodataOpen(true);
      fitView({ nodes: [foundNode], duration: 800, maxZoom: 1 });
    } else {
      alert('Anggota tidak ditemukan!');
    }
  };

  const handleAddChild = useCallback((parentId: string) => {
    const newId = Date.now().toString();
    const newPerson: Person = { id: newId, name: 'Anak Baru', gender: 'male', relationType: 'blood', parents: [parentId], children: [], spouses: [] };
    const newNode: Node = { id: newId, type: 'person', data: newPerson, position: { x: 0, y: 0 } };
    const newEdge: Edge = { id: `e${parentId}-${newId}`, source: parentId, sourceHandle: 'bottom', target: newId, targetHandle: 'top', type: 'custom', data: { color: getRandomEdgeColor() } };

    const oldParent = nodes.find(n => n.id === parentId);
    const nextNodes = [...nodes, newNode];
    const nextEdges = [...edges, newEdge];
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(nextNodes, nextEdges);
    
    if (oldParent) {
      const newParent = layoutedNodes.find(n => n.id === parentId);
      if (newParent) {
        const dx = oldParent.position.x - newParent.position.x;
        const dy = oldParent.position.y - newParent.position.y;
        layoutedNodes.forEach(n => {
          n.position.x += dx;
          n.position.y += dy;
        });
      }
    }
    
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [nodes, edges, setNodes, setEdges]);

  const handleAddPartner = useCallback((partnerId: string) => {
    const newId = Date.now().toString();
    const newPerson: Person = { id: newId, name: 'Pasangan Baru', gender: 'female', relationType: 'partner', parents: [], children: [], spouses: [partnerId] };
    const newNode: Node = { id: newId, type: 'person', data: newPerson, position: { x: 0, y: 0 } };
    const newEdge: Edge = { id: `e${partnerId}-${newId}`, source: partnerId, sourceHandle: 'right', target: newId, targetHandle: 'left', type: 'custom', data: { color: getRandomEdgeColor(), isPartner: true } };

    const oldParent = nodes.find(n => n.id === partnerId);
    const nextNodes = [...nodes, newNode];
    const nextEdges = [...edges, newEdge];
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(nextNodes, nextEdges);
    
    if (oldParent) {
      const newParent = layoutedNodes.find(n => n.id === partnerId);
      if (newParent) {
        const dx = oldParent.position.x - newParent.position.x;
        const dy = oldParent.position.y - newParent.position.y;
        layoutedNodes.forEach(n => {
          n.position.x += dx;
          n.position.y += dy;
        });
      }
    }

    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [nodes, edges, setNodes, setEdges]);

  const handleDeleteNode = useCallback((nodeId: string) => {
    if (window.confirm('Yakin ingin menghapus anggota ini beserta seluruh keturunan dan pasangannya?')) {
      const getSubTreeIds = (startId: string, allEdges: Edge[]): string[] => {
        const idsToDelete = new Set<string>([startId]);
        let queue = [startId];
        
        while (queue.length > 0) {
          const current = queue.shift()!;
          allEdges.forEach(e => {
            if (e.source === current && !idsToDelete.has(e.target)) {
              idsToDelete.add(e.target);
              queue.push(e.target);
            }
          });
        }
        return Array.from(idsToDelete);
      };

      const idsToRemove = getSubTreeIds(nodeId, edges);
      const nextNodes = nodes.filter(n => !idsToRemove.includes(n.id));
      const nextEdges = edges.filter(e => !idsToRemove.includes(e.source) && !idsToRemove.includes(e.target));
      
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(nextNodes, nextEdges);
      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
      
      if (selectedPerson && idsToRemove.includes(selectedPerson.id)) {
        setIsBiodataOpen(false);
      }
    }
  }, [nodes, edges, selectedPerson, setNodes, setEdges]);

  const handleDownload = () => {
    const flowElement = document.querySelector('.react-flow') as HTMLElement;
    if (flowElement) {
      toPng(flowElement, {
        backgroundColor: isDarkMode ? '#1f2937' : '#f9fafb', // matches bg-gray-50
      }).then((dataUrl) => {
        const link = document.createElement('a');
        link.download = 'pohon-keluarga.png';
        link.href = dataUrl;
        link.click();
      });
    }
  };

  // Load from Supabase on mount
  useEffect(() => {
    const loadFromSupabase = async () => {
      setIsDbLoading(true);
      try {
        const { data, error } = await supabase
          .from('trees')
          .select('nodes, edges')
          .eq('id', 'default')
          .single();

        let startNodes: Node[] = initialNodes;
        let startEdges: Edge[] = initialEdges;

        if (!error && data) {
          const dbNodes = data.nodes as Node[];
          const dbEdges = data.edges as Edge[];
          if (dbNodes && dbNodes.length > 0) {
            startNodes = dbNodes;
            startEdges = dbEdges || [];
          }
        }

        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(startNodes, startEdges);
        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
        setIsLoaded(true);

        setTimeout(() => {
          fitView({ duration: 800, padding: 0.5 });
        }, 100);
      } catch (err) {
        console.error('Error loading from Supabase:', err);
        // Fallback to initial data
        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(initialNodes, initialEdges);
        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
        setIsLoaded(true);
      } finally {
        setIsDbLoading(false);
      }
    };
    loadFromSupabase();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-save to Supabase with debounce (500ms)
  useEffect(() => {
    if (!isLoaded) return;

    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(async () => {
      setIsSaving(true);
      try {
        await supabase
          .from('trees')
          .upsert({ id: 'default', nodes, edges, updated_at: new Date().toISOString() });
      } catch (err) {
        console.error('Error saving to Supabase:', err);
      } finally {
        setIsSaving(false);
      }
    }, 500);
  }, [nodes, edges, isLoaded]);

  // Supabase Realtime — sync perubahan dari device lain
  useEffect(() => {
    const channel = supabase
      .channel('trees-realtime')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'trees', filter: 'id=eq.default' },
        (payload) => {
          // Hanya update jika bukan kita sendiri yang menyimpan
          if (isSaving) return;
          const newNodes = (payload.new as { nodes: Node[]; edges: Edge[] }).nodes as Node[];
          const newEdges = (payload.new as { nodes: Node[]; edges: Edge[] }).edges as Edge[];
          if (newNodes && newEdges) {
            const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(newNodes, newEdges);
            setNodes(layoutedNodes);
            setEdges(layoutedEdges);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSaving]);

  const onRecenter = useCallback(() => {
    // Recenter visually means fitting the view to show all or focus on root
    fitView({ duration: 800, padding: 0.5 });
  }, [fitView]);

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedPerson(node.data as unknown as Person);
    setIsBiodataOpen(true);
  }, []);

  const handleSavePerson = (updatedPerson: Person) => {
    setNodes(nds =>
      nds.map(n => {
        if (n.id === updatedPerson.id) {
          return { ...n, data: { ...n.data, ...updatedPerson } };
        }
        return n;
      })
    );
    setSelectedPerson(updatedPerson);
    setIsEditModalOpen(false);
  };

  const nodesWithProps = React.useMemo(() => {
    return nodes.map(node => ({
      ...node,
      data: {
        ...node.data,
        isAdmin,
        isDarkMode,
        isRoot: node.id === '1',
        onAddChild: handleAddChild,
        onAddPartner: handleAddPartner,
        onDeleteNode: handleDeleteNode,
      }
    }));
  }, [nodes, isAdmin, isDarkMode, handleAddChild, handleAddPartner, handleDeleteNode]);

  const stats = React.useMemo(() => {
    const nodeGens = new Map<string, number>();
    const partnerTargets = new Set(edges.filter(e => e.targetHandle === 'left').map(e => e.target));
    const childTargets = new Set(edges.filter(e => e.targetHandle === 'top').map(e => e.target));

    const rootNodes = nodes.filter(n => !childTargets.has(n.id) && !partnerTargets.has(n.id));

    rootNodes.forEach(n => nodeGens.set(n.id, 0));
    let queue = rootNodes.map(n => n.id);

    while (queue.length > 0) {
      const current = queue.shift()!;
      const currentGen = nodeGens.get(current)!;

      edges.forEach(e => {
        if (e.source === current) {
          if (e.targetHandle === 'top') {
            if (!nodeGens.has(e.target)) {
              nodeGens.set(e.target, currentGen + 1);
              queue.push(e.target);
            }
          } else if (e.targetHandle === 'left') {
            if (!nodeGens.has(e.target)) {
              nodeGens.set(e.target, currentGen);
              queue.push(e.target);
            }
          }
        }
      });
    }

    let anak = 0;
    let menantu = 0;
    let cucu = 0;
    let cicit = 0;
    let pasangan = 0;

    nodes.forEach(n => {
      const p = n.data as unknown as Person;
      if (p.relationType === 'partner') pasangan++;
      
      const gen = nodeGens.get(n.id);
      if (gen === 1) {
        if (p.relationType === 'blood') anak++;
        if (p.relationType === 'partner') menantu++;
      } else if (gen === 2) {
        if (p.relationType === 'blood') cucu++;
      } else if (gen !== undefined && gen >= 3) {
        if (p.relationType === 'blood') cicit++;
      }
    });

    return { total: nodes.length, pasangan, anak, menantu, cucu, cicit };
  }, [nodes, edges]);

  return (
    <div className="w-full h-full relative">
      {/* Full-screen loading overlay */}
      {isDbLoading && (
        <div className={`absolute inset-0 z-50 flex flex-col items-center justify-center gap-3 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Memuat data silsilah...</p>
        </div>
      )}

      {/* Saving indicator */}
      {isSaving && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-indigo-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg">
          <CloudUpload className="w-3.5 h-3.5 animate-pulse" />
          Menyimpan...
        </div>
      )}

    <ReactFlow
      nodes={nodesWithProps}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onNodeClick={onNodeClick}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      nodesDraggable={false}
      colorMode={isDarkMode ? 'dark' : 'light'}
      className={isDarkMode ? "bg-gray-900" : "bg-gray-50"}
    >
      <Background variant={BackgroundVariant.Dots} gap={16} size={1} color={isDarkMode ? '#4b5563' : '#cbd5e1'} />
      <Controls />
      <MiniMap />
      
      {/* Top Right Panel: Actions */}
      <Panel position="top-right" className={`${isDarkMode ? 'bg-gray-800 border-gray-700 shadow-gray-900' : 'bg-white border-gray-100 shadow-md'} p-2 rounded-xl flex gap-2 mr-2 mt-2`}>
        <button className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`} title="Cari" onClick={handleSearch}>
          <Search className="w-5 h-5" />
        </button>
        <button className={`p-2 rounded-lg transition-colors ${isAdmin ? (isDarkMode ? 'text-indigo-400 bg-indigo-900/50' : 'text-indigo-600 bg-indigo-50') : (isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600')}`} title="Mode Admin" onClick={toggleAdmin}>
          <Lock className="w-5 h-5" />
        </button>
        <button className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'text-indigo-400 bg-indigo-900/50 hover:bg-indigo-900/70' : 'hover:bg-gray-100 text-gray-600'}`} title="Mode Gelap" onClick={toggleDarkMode}>
          <Moon className="w-5 h-5" />
        </button>
        <button className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'}`} title="Unduh Kanvas" onClick={handleDownload}>
          <Download className="w-5 h-5" />
        </button>
        {/* Tombol Statistik */}
        <div className="relative">
          <button
            className={`p-2 rounded-lg transition-colors ${isStatsOpen ? (isDarkMode ? 'text-emerald-400 bg-emerald-900/50' : 'text-emerald-600 bg-emerald-50') : (isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600')}`}
            title="Statistik Keluarga"
            onClick={() => setIsStatsOpen(v => !v)}
          >
            <BarChart2 className="w-5 h-5" />
          </button>
          {/* Stats Dropdown */}
          {isStatsOpen && (
            <div className={`absolute right-0 top-11 w-52 rounded-2xl shadow-2xl p-4 text-sm z-50 border ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-white border-gray-100 text-gray-700'}`}>
              <h3 className={`font-bold border-b pb-2 mb-2 ${isDarkMode ? 'border-gray-700 text-gray-100' : 'border-gray-100 text-gray-800'}`}>Statistik Keluarga</h3>
              <div className="flex justify-between py-1"><span>Total Anggota:</span><span className={`font-semibold ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>{stats.total}</span></div>
              <div className={`flex justify-between py-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}><span>Anak (Gen 1):</span><span className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{stats.anak}</span></div>
              <div className={`flex justify-between py-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}><span>Menantu:</span><span className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{stats.menantu}</span></div>
              <div className={`flex justify-between py-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}><span>Cucu (Gen 2):</span><span className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{stats.cucu}</span></div>
              <div className={`flex justify-between py-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}><span>Cicit+ (Gen 3+):</span><span className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>{stats.cicit}</span></div>
            </div>
          )}
        </div>
        <button
          className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-indigo-900/50 text-indigo-400' : 'hover:bg-indigo-50 text-indigo-600'}`}
          title="Recenter"
          onClick={onRecenter}
        >
          <Focus className="w-5 h-5" />
        </button>
      </Panel>

      {/* Bottom Left Panel: Stats REMOVED — now a button in top panel */}

      <BiodataPanel 
        person={selectedPerson}
        isOpen={isBiodataOpen}
        isDarkMode={isDarkMode}
        onClose={() => setIsBiodataOpen(false)}
        onEdit={() => {
          setIsBiodataOpen(false);
          setIsEditModalOpen(true);
        }}
      />

      <EditModal 
        person={selectedPerson}
        isOpen={isEditModalOpen}
        isDarkMode={isDarkMode}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSavePerson}
      />
    </ReactFlow>
    </div>
  );
}

export default function FamilyTreeCanvas() {
  return (
    <div className="w-full h-screen">
      <ReactFlowProvider>
        <FlowCanvas />
      </ReactFlowProvider>
    </div>
  );
}
