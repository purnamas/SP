import React, { useState } from 'react';
import { TeacherInfo } from '../types';
import { ChevronUpIcon, ChevronDownIcon } from './Icons';

interface TeacherInfoEditorProps {
  initialInfo: TeacherInfo;
  onSave: (info: TeacherInfo) => void;
}

const TeacherInfoEditor: React.FC<TeacherInfoEditorProps> = ({ initialInfo, onSave }) => {
  const [info, setInfo] = useState<TeacherInfo>(initialInfo);
  const [isCollapsed, setIsCollapsed] = useState(true);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(info);
    setIsCollapsed(true);
    alert('Informasi guru berhasil disimpan!');
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl my-6 border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center p-4 cursor-pointer" onClick={() => setIsCollapsed(!isCollapsed)}>
        <h2 className="text-xl font-bold">Informasi Guru & Mata Pelajaran</h2>
        <button className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">
          {isCollapsed ? <ChevronDownIcon className="w-6 h-6"/> : <ChevronUpIcon className="w-6 h-6"/>}
        </button>
      </div>
      {!isCollapsed && (
        <form onSubmit={handleSave} className="p-6 pt-0 space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="name">Nama Guru</label>
              <input type="text" id="name" name="name" value={info.name} onChange={handleChange} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="subject">Mata Pelajaran</label>
              <input type="text" id="subject" name="subject" value={info.subject} onChange={handleChange} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="nip">NIP</label>
              <input type="text" id="nip" name="nip" value={info.nip} onChange={handleChange} placeholder="Kosongkan jika tidak ada" className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2" />
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

export default TeacherInfoEditor;
