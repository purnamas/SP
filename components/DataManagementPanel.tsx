import React, { useState, useRef } from 'react';
import { UploadIcon, DownloadIcon, ChevronDownIcon, ChevronUpIcon, AlertTriangleIcon } from './Icons';

interface DataManagementPanelProps {
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBackup: () => void;
}

const DataManagementPanel: React.FC<DataManagementPanelProps> = ({ onImport, onBackup }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl my-6 border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center p-4 cursor-pointer" onClick={() => setIsCollapsed(!isCollapsed)}>
        <h2 className="text-xl font-bold">Pengaturan Data &amp; Cadangan</h2>
        <button className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">
          {isCollapsed ? <ChevronDownIcon className="w-6 h-6"/> : <ChevronUpIcon className="w-6 h-6"/>}
        </button>
      </div>
      {!isCollapsed && (
        <div className="p-6 pt-0">
          <input
            type="file"
            ref={fileInputRef}
            onChange={onImport}
            accept="application/json"
            className="hidden"
          />
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg">Backup Database</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Simpan semua data jurnal, informasi guru, dan sekolah ke dalam sebuah file JSON. File ini dapat digunakan untuk memulihkan data Anda di kemudian hari.</p>
              <button onClick={onBackup} className="flex items-center justify-center gap-2 bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-yellow-600 transition-colors">
                <DownloadIcon className="w-5 h-5"/>
                <span>Backup Database</span>
              </button>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h3 className="font-semibold text-lg">Impor Database</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Impor data dari file backup JSON.</p>
              <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 mb-3">
                <AlertTriangleIcon className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0"/>
                <p className="text-sm text-red-700 dark:text-red-300">
                  <strong>Peringatan:</strong> Proses impor akan <span className="font-bold">menghapus seluruh data yang ada saat ini</span> dan menggantinya dengan data dari file yang Anda unggah. Pastikan Anda telah melakukan backup jika diperlukan.
                </p>
              </div>
              <button onClick={handleImportClick} className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-green-700 transition-colors">
                <UploadIcon className="w-5 h-5"/>
                <span>Impor Database</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataManagementPanel;
