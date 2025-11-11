import React, { useState, useEffect } from 'react';
import { SchoolInfo } from '../types';
import { ChevronUpIcon, ChevronDownIcon } from './Icons';

interface SchoolInfoEditorProps {
  initialInfo: SchoolInfo;
  onSave: (info: SchoolInfo) => void;
}

const SchoolInfoEditor: React.FC<SchoolInfoEditorProps> = ({ initialInfo, onSave }) => {
  const [info, setInfo] = useState<SchoolInfo>(initialInfo);
  const [isCollapsed, setIsCollapsed] = useState(true);
  
  useEffect(() => {
    setInfo(initialInfo);
  }, [initialInfo]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(info);
    setIsCollapsed(true);
    alert('Informasi sekolah berhasil disimpan!');
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl my-6 border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center p-4 cursor-pointer" onClick={() => setIsCollapsed(!isCollapsed)}>
        <h2 className="text-xl font-bold">Informasi Sekolah &amp; Cetak</h2>
        <button className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">
          {isCollapsed ? <ChevronDownIcon className="w-6 h-6"/> : <ChevronUpIcon className="w-6 h-6"/>}
        </button>
      </div>
      {!isCollapsed && (
        <form onSubmit={handleSave} className="p-6 pt-0 space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1" htmlFor="schoolName">Nama Sekolah</label>
              <input type="text" id="schoolName" name="schoolName" value={info.schoolName} onChange={handleChange} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2" required />
            </div>
             <div>
              <label className="block text-sm font-medium mb-1" htmlFor="academicYear">Tahun Ajaran</label>
              <input type="text" id="academicYear" name="academicYear" value={info.academicYear} onChange={handleChange} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="principalName">Nama Kepala Sekolah</label>
              <input type="text" id="principalName" name="principalName" value={info.principalName} onChange={handleChange} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="principalNip">NIP Kepala Sekolah</label>
              <input type="text" id="principalNip" name="principalNip" value={info.principalNip} onChange={handleChange} placeholder="Kosongkan jika tidak ada" className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="printLocation">Tempat Cetak</label>
              <input type="text" id="printLocation" name="printLocation" value={info.printLocation} onChange={handleChange} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2" required />
            </div>
          </div>
          <div className="flex justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">Simpan Informasi</button>
          </div>
        </form>
      )}
    </div>
  );
};

export default SchoolInfoEditor;
