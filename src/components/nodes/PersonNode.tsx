import React from 'react';
import { Handle, Position, NodeProps, Node } from '@xyflow/react';
import { User, Plus, Trash2 } from 'lucide-react';
import { Person } from '@/types/family';

export type PersonNodeData = Person & {
  onAddChild?: (parentId: string) => void;
  onAddPartner?: (partnerId: string) => void;
  onViewDetails?: (personId: string) => void;
  onDeleteNode?: (nodeId: string) => void;
  isAdmin?: boolean;
  isDarkMode?: boolean;
  isRoot?: boolean;
};

export type PersonNodeType = Node<PersonNodeData, 'person'>;

export function PersonNode({ data, isConnectable }: NodeProps<PersonNodeType>) {
  const { 
    id, name, gender, birthDate, deathDate, photoUrl, relationType,
    onAddChild, onAddPartner, onViewDetails, onDeleteNode, isAdmin, isDarkMode, isRoot
  } = data;

  // Colors based on gender and dark mode
  let bgClass = gender === 'male' ? 'bg-blue-50 border-blue-200' : 'bg-pink-50 border-pink-200';
  let textClass = 'text-gray-800';
  let subTextClass = 'text-gray-500';
  let iconClass = 'text-gray-400';
  let placeholderBgClass = 'bg-white border-gray-200';

  if (isDarkMode) {
    bgClass = gender === 'male' ? 'bg-blue-900 border-blue-700' : 'bg-pink-900 border-pink-700';
    textClass = 'text-gray-100';
    subTextClass = 'text-gray-400';
    iconClass = 'text-gray-500';
    placeholderBgClass = 'bg-gray-800 border-gray-700';
  }

  return (
    <div 
      className={`relative w-40 aspect-square rounded-xl border-2 p-4 shadow-sm hover:shadow-md transition-shadow ${bgClass} flex flex-col items-center justify-center cursor-pointer`}
      onClick={(e) => {
        // Prevent triggering if clicking action buttons
        if ((e.target as HTMLElement).closest('button')) return;
        if (onViewDetails) onViewDetails(id);
      }}
    >
      {/* Top handle for incoming connections (parents) */}
      <Handle type="target" id="top" position={Position.Top} isConnectable={isConnectable} className="opacity-0" />
      <Handle type="target" id="left" position={Position.Left} isConnectable={isConnectable} className="opacity-0" />

      {/* Delete Button (Admin Only, Not for Root) */}
      {isAdmin && !isRoot && (
        <button
          onClick={(e) => { e.stopPropagation(); onDeleteNode?.(id); }}
          className="absolute -top-2 -right-2 p-1.5 bg-red-100 hover:bg-red-200 text-red-600 rounded-full shadow-sm transition-colors z-10 border border-red-200"
          title="Hapus Anggota"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}

      {/* Photo Placeholder */}
      <div className={`w-16 h-16 rounded-full border shadow-inner flex items-center justify-center overflow-hidden mb-3 ${placeholderBgClass}`}>
        {photoUrl ? (
          <img src={photoUrl} alt={name} className="w-full h-full object-cover" />
        ) : (
          <User className={`w-8 h-8 ${iconClass}`} />
        )}
      </div>

      {/* Details */}
      <div className="text-center w-full">
        <h3 className={`font-bold text-sm truncate ${textClass}`}>{name}</h3>
        <p className={`text-xs mt-1 ${subTextClass}`}>
          {birthDate ? new Date(birthDate).getFullYear() : '?'} - {deathDate ? new Date(deathDate).getFullYear() : 'Sekarang'}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="absolute -bottom-3 flex gap-2">
        {relationType === 'blood' && (
          <button 
            onClick={(e) => { e.stopPropagation(); onAddPartner?.(id); }}
            className={`flex items-center justify-center gap-1 border text-xs px-3 py-1 rounded-full shadow-sm transition-colors ${isDarkMode ? 'bg-gray-800 border-gray-600 text-indigo-400 hover:bg-gray-700 hover:text-indigo-300' : 'bg-white border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700'}`}
            title="Tambah Pasangan"
          >
            <Plus className="w-3 h-3" /> Pasangan
          </button>
        )}
        {relationType === 'partner' && (
          <button 
            onClick={(e) => { e.stopPropagation(); onAddChild?.(id); }}
            className={`flex items-center justify-center gap-1 border text-xs px-3 py-1 rounded-full shadow-sm transition-colors ${isDarkMode ? 'bg-gray-800 border-gray-600 text-green-400 hover:bg-gray-700 hover:text-green-300' : 'bg-white border-green-200 text-green-600 hover:bg-green-50 hover:text-green-700'}`}
            title="Tambah Anak"
          >
            <Plus className="w-3 h-3" /> Anak
          </button>
        )}
      </div>

      {/* Bottom handle for outgoing connections (children) */}
      <Handle type="source" id="bottom" position={Position.Bottom} isConnectable={isConnectable} className="opacity-0" />
      <Handle type="source" id="right" position={Position.Right} isConnectable={isConnectable} className="opacity-0" />
    </div>
  );
}
