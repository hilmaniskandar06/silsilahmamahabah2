import React from 'react';
import { X, Edit2, User } from 'lucide-react';
import { Person } from '@/types/family';

interface BiodataPanelProps {
  person: Person | null;
  isOpen: boolean;
  isDarkMode?: boolean;
  onClose: () => void;
  onEdit: () => void;
}

export function BiodataPanel({ person, isOpen, isDarkMode, onClose, onEdit }: BiodataPanelProps) {
  if (!isOpen || !person) return null;

  const getAge = () => {
    if (!person.birthDate) return null;
    const birth = new Date(person.birthDate);
    const end = person.deathDate ? new Date(person.deathDate) : new Date();
    let age = end.getFullYear() - birth.getFullYear();
    const m = end.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && end.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };
  
  const age = getAge();


  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/20 z-40 md:hidden" 
        onClick={onClose}
      />

      {/* Panel: Bottom Sheet on Mobile, Sidebar on Desktop */}
      <div className={`
        fixed z-50 ${isDarkMode ? 'bg-gray-900 text-gray-100 border-l border-gray-800' : 'bg-white text-gray-800'} shadow-2xl transition-transform duration-300 ease-in-out
        w-full h-[60vh] bottom-0 left-0 rounded-t-3xl
        md:w-96 md:h-full md:top-0 md:right-0 md:left-auto md:bottom-auto md:rounded-none
        flex flex-col
      `}>
        {/* Header */}
        <div className={`flex justify-between items-center p-4 border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-100'}`}>
          <h2 className="font-bold text-lg">Detail Anggota</h2>
          <button 
            onClick={onClose} 
            className={`p-2 rounded-full transition-colors ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700 text-gray-400' : 'bg-gray-50 hover:bg-gray-100 text-gray-500'}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center">
          {/* Photo */}
          <div className={`w-32 h-32 rounded-full border-4 ${isDarkMode ? 'border-gray-800 bg-gray-800' : 'border-indigo-50 bg-gray-100'} flex items-center justify-center overflow-hidden mb-4 shadow-sm`}>
            {person.photoUrl ? (
              <img src={person.photoUrl} alt={person.name} className="w-full h-full object-cover" />
            ) : (
              <User className={`w-16 h-16 ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`} />
            )}
          </div>

          {/* Info */}
          <h3 className="text-2xl font-bold text-center mb-1 break-words w-full px-2">{person.name}</h3>
          <p className={`text-sm font-medium capitalize px-3 py-1 rounded-full mb-6 ${isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-50 text-gray-500'}`}>
            {person.gender === 'male' ? 'Laki-laki' : 'Perempuan'}
          </p>

          <div className={`w-full rounded-2xl p-4 space-y-3 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
            <div className={`flex justify-between items-center border-b pb-2 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Tanggal Lahir</span>
              <span className={`font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                {person.birthDate ? new Date(person.birthDate).toLocaleDateString('id-ID') : '-'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Tanggal Wafat</span>
              <span className={`font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                {person.deathDate ? new Date(person.deathDate).toLocaleDateString('id-ID') : 'Sekarang'}
              </span>
            </div>
            {age !== null && (
              <div className={`flex justify-between items-center border-t pt-2 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Usia</span>
                <span className={`font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{age} Tahun</span>
              </div>
            )}
            {person.address && (
              <div className={`flex flex-col border-t pt-2 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <span className={`text-sm mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Alamat</span>
                <span className={`font-medium text-sm break-words ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{person.address}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className={`p-4 border-t ${isDarkMode ? 'border-gray-800 bg-gray-900 md:bg-gray-900' : 'border-gray-100 bg-white md:bg-gray-50'}`}>
          <button 
            onClick={onEdit}
            className={`w-full py-3 px-4 rounded-xl font-semibold flex justify-center items-center gap-2 transition-colors shadow-sm ${isDarkMode ? 'bg-indigo-500 hover:bg-indigo-600 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
          >
            <Edit2 className="w-4 h-4" />
            Edit Data
          </button>
        </div>
      </div>
    </>
  );
}
