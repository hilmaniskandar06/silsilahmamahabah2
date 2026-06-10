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
    const birth = new Date(person.birthDate as string);
    const end = person.deathDate ? new Date(person.deathDate as string) : new Date();
    let age = end.getFullYear() - birth.getFullYear();
    const m = end.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && end.getDate() < birth.getDate())) age--;
    return age;
  };

  const age = getAge();

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
        onClick={onClose}
      >
        {/* Modal */}
        <div
          className={`${isDarkMode ? 'bg-gray-900 text-gray-100 border border-gray-800' : 'bg-white text-gray-800'} rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden flex flex-col max-h-[90vh]`}
          onClick={e => e.stopPropagation()}
        >
          {/* Header — hanya tombol close, tanpa judul */}
          <div className={`flex justify-end items-center px-5 pt-4 ${isDarkMode ? '' : ''}`}>
            <button
              onClick={onClose}
              className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 pb-2 flex flex-col items-center">
            {/* Photo */}
            <div className={`w-28 h-28 rounded-full border-4 ${isDarkMode ? 'border-gray-800 bg-gray-800' : 'border-indigo-50 bg-gray-100'} flex items-center justify-center overflow-hidden mb-4 shadow-sm`}>
              {person.photoUrl ? (
                <img src={person.photoUrl as string} alt={person.name} className="w-full h-full object-cover" />
              ) : (
                <User className={`w-14 h-14 ${isDarkMode ? 'text-gray-600' : 'text-gray-300'}`} />
              )}
            </div>

            {/* Name & Gender */}
            <h3 className="text-2xl font-bold text-center mb-1 break-words w-full px-2">{person.name}</h3>
            <p className={`text-sm font-medium capitalize px-3 py-1 rounded-full mb-5 ${isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-50 text-gray-500'}`}>
              {person.gender === 'male' ? 'Laki-laki' : 'Perempuan'}
            </p>

            {/* Info rows */}
            <div className={`w-full rounded-2xl p-4 space-y-3 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div className={`flex justify-between items-center border-b pb-2 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Tanggal Lahir</span>
                <span className={`font-semibold text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                  {person.birthDate ? new Date(person.birthDate as string).toLocaleDateString('id-ID') : '-'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Tanggal Wafat</span>
                <span className={`font-semibold text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                  {person.deathDate ? new Date(person.deathDate as string).toLocaleDateString('id-ID') : 'Sekarang'}
                </span>
              </div>
              {age !== null && (
                <div className={`flex justify-between items-center border-t pt-2 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Usia</span>
                  <span className={`font-semibold text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{age} Tahun</span>
                </div>
              )}
              {person.address && (
                <div className={`flex flex-col border-t pt-2 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <span className={`text-sm mb-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Alamat</span>
                  <span className={`font-medium text-sm break-words ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{person.address as string}</span>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className={`p-5 border-t ${isDarkMode ? 'border-gray-800' : 'border-gray-100'}`}>
            <button
              onClick={onEdit}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold flex justify-center items-center gap-2 transition-colors shadow-sm"
            >
              <Edit2 className="w-4 h-4" />
              Edit Data
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
