import React, { useState, useRef } from 'react';
import { X, Upload, Trash2, Save, Loader2 } from 'lucide-react';
import { Person, Gender } from '@/types/family';
import { PhotoCropper } from './PhotoCropper';
import { supabase } from '@/lib/supabase';

interface EditModalProps {
  person: Person | null;
  isOpen: boolean;
  isDarkMode?: boolean;
  onClose: () => void;
  onSave: (updatedPerson: Person) => void;
}

export function EditModal({ person, isOpen, isDarkMode, onClose, onSave }: EditModalProps) {
  if (!isOpen || !person) return null;

  const [formData, setFormData] = useState<Person>({ ...person });
  const [photoToCrop, setPhotoToCrop] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleClear = () => {
    setFormData({
      ...person,
      name: '',
      birthDate: '',
      deathDate: '',
      address: '',
      photoUrl: null
    });
  };

  const handleSave = () => {
    onSave(formData);
  };

  // Upload cropped base64 image to Supabase Storage
  const handleCroppedPhoto = async (croppedBase64: string) => {
    setPhotoToCrop(null);
    setIsUploadingPhoto(true);
    try {
      // Convert base64 to Blob
      const res = await fetch(croppedBase64);
      const blob = await res.blob();
      const ext = blob.type.split('/')[1] || 'jpg';
      const fileName = `${person.id}_${Date.now()}.${ext}`;

      // Upload to Supabase Storage bucket 'photos'
      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(fileName, blob, { upsert: true, contentType: blob.type });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('photos')
        .getPublicUrl(fileName);

      setFormData(prev => ({ ...prev, photoUrl: urlData.publicUrl }));
    } catch (err) {
      console.error('Gagal upload foto:', err);
      // Fallback: simpan base64 jika upload gagal
      setFormData(prev => ({ ...prev, photoUrl: croppedBase64 }));
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setPhotoToCrop(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
        <div className={`${isDarkMode ? 'bg-gray-900 text-gray-100 border border-gray-800' : 'bg-white text-gray-800'} rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]`}>
          {/* Header */}
          <div className={`flex justify-between items-center p-5 border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-100'}`}>
            <h2 className="font-bold text-xl">Edit Data</h2>
            <button onClick={onClose} className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}>
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto flex-1 space-y-5">
            {/* Photo Upload */}
            <div className="flex flex-col items-center gap-3">
              <div className={`w-24 h-24 rounded-full border-2 border-dashed ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-300 bg-gray-50'} flex items-center justify-center overflow-hidden relative group cursor-pointer`} onClick={() => !isUploadingPhoto && fileInputRef.current?.click()}>
                {isUploadingPhoto ? (
                  <div className="flex flex-col items-center gap-1 text-indigo-500">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span className="text-xs">Mengunggah...</span>
                  </div>
                ) : formData.photoUrl ? (
                  <>
                    <img src={formData.photoUrl} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Upload className="w-6 h-6 text-white" />
                    </div>
                  </>
                ) : (
                  <div className={`${isDarkMode ? 'text-gray-500' : 'text-gray-400'} flex flex-col items-center`}>
                    <Upload className="w-6 h-6" />
                    <span className="text-xs mt-1">Unggah</span>
                  </div>
                )}
              </div>
              <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
            </div>

            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Nama Lengkap</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} className={`w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`} placeholder="Masukkan nama..." />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Tanggal Lahir</label>
                  <input type="date" name="birthDate" value={formData.birthDate || ''} onChange={handleChange} className={`w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white [color-scheme:dark]' : 'bg-white border-gray-200 text-gray-900'}`} />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Tanggal Wafat</label>
                  <input type="date" name="deathDate" value={formData.deathDate || ''} onChange={handleChange} className={`w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white [color-scheme:dark]' : 'bg-white border-gray-200 text-gray-900'}`} />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Jenis Kelamin</label>
                <select name="gender" value={formData.gender} onChange={handleChange} className={`w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
                  <option value="male">Laki-laki</option>
                  <option value="female">Perempuan</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Alamat</label>
                <textarea 
                  name="address" 
                  value={formData.address || ''} 
                  onChange={(e) => handleChange(e as unknown as React.ChangeEvent<HTMLInputElement>)} 
                  rows={3}
                  className={`w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`} 
                  placeholder="Masukkan alamat lengkap..." 
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className={`p-5 border-t flex gap-3 ${isDarkMode ? 'border-gray-800 bg-gray-900/50' : 'border-gray-100 bg-gray-50'}`}>
            <button onClick={handleClear} className={`flex-1 py-2.5 px-4 border rounded-xl font-semibold flex justify-center items-center gap-2 transition-colors shadow-sm ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700' : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-700'}`}>
              <Trash2 className="w-4 h-4" />
              Bersihkan Form
            </button>
            <button onClick={handleSave} className="flex-1 py-2.5 px-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold flex justify-center items-center gap-2 transition-colors shadow-sm">
              <Save className="w-4 h-4" />
              Simpan
            </button>
          </div>
        </div>
      </div>

      {photoToCrop && (
        <PhotoCropper 
          imageSrc={photoToCrop} 
          onCancel={() => setPhotoToCrop(null)} 
          onSave={handleCroppedPhoto}
        />
      )}
    </>
  );
}
