import React from 'react';
import { JournalEntry, AttendanceRecord } from '../types';
import { Trash2Icon, EditIcon, CopyIcon } from './Icons';

interface JournalTableProps {
  entries: JournalEntry[];
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onCopy: (id: string) => void;
  selectedEntryIds: string[];
  onToggleSelection: (id: string) => void;
  onSelectAll: (select: boolean) => void;
}

const formatDate = (dateString: string) => {
    // Fix: Create date as UTC to avoid timezone issues
    const parts = dateString.split('-').map(s => parseInt(s, 10));
    const date = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));

    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const dayName = days[date.getUTCDay()];
    return `${dayName}, ${date.toLocaleDateString('id-ID', { timeZone: 'UTC' })}`;
};

const AttendanceCell: React.FC<{ attendance: AttendanceRecord[] }> = ({ attendance }) => {
    if (attendance.length === 0) {
        return <span className="text-green-600 dark:text-green-400">Hadir Semua</span>;
    }

    const s = attendance.filter(a => a.status === 'S').map(a => a.name);
    const i = attendance.filter(a => a.status === 'I').map(a => a.name);
    const a = attendance.filter(a => a.status === 'A').map(a => a.name);

    return (
        <div className="text-xs">
            {s.length > 0 && <div><span className="font-semibold">S:</span> {s.join(', ')}</div>}
            {i.length > 0 && <div><span className="font-semibold">I:</span> {i.join(', ')}</div>}
            {a.length > 0 && <div><span className="font-semibold">A:</span> {a.join(', ')}</div>}
        </div>
    );
};


const JournalTable: React.FC<JournalTableProps> = ({ entries, onDelete, onEdit, onCopy, selectedEntryIds, onToggleSelection, onSelectAll }) => {
  const areAllSelected = entries.length > 0 && selectedEntryIds.length === entries.length;

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-x-auto">
      <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th scope="col" className="p-4">
              <div className="flex items-center">
                <input 
                  id="checkbox-all-search" 
                  type="checkbox" 
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  checked={areAllSelected}
                  onChange={(e) => onSelectAll(e.target.checked)}
                />
                <label htmlFor="checkbox-all-search" className="sr-only">checkbox</label>
              </div>
            </th>
            <th scope="col" className="px-4 py-3">No</th>
            <th scope="col" className="px-4 py-3">Hari, Tanggal</th>
            <th scope="col" className="px-4 py-3">Kelas</th>
            <th scope="col" className="px-4 py-3">Jam Ke</th>
            <th scope="col" className="px-4 py-3">Materi/Kegiatan</th>
            <th scope="col" className="px-4 py-3">Hambatan</th>
            <th scope="col" className="px-4 py-3">Tindak Lanjut</th>
            <th scope="col" className="px-4 py-3">Kehadiran Siswa</th>
            <th scope="col" className="px-4 py-3">Keterangan</th>
            <th scope="col" className="px-4 py-3">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {entries.length > 0 ? entries.map((entry, index) => (
            <tr key={entry.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
              <td className="w-4 p-4">
                <div className="flex items-center">
                  <input 
                    id={`checkbox-table-search-${entry.id}`} 
                    type="checkbox" 
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    checked={selectedEntryIds.includes(entry.id)}
                    onChange={() => onToggleSelection(entry.id)}
                  />
                  <label htmlFor={`checkbox-table-search-${entry.id}`} className="sr-only">checkbox</label>
                </div>
              </td>
              <td className="px-4 py-4 text-center">{index + 1}</td>
              <td className="px-4 py-4 whitespace-nowrap">{formatDate(entry.date)}</td>
              <td className="px-4 py-4 text-center">{entry.class}</td>
              <td className="px-4 py-4 text-center">{entry.hours.join(', ')}</td>
              <td className="px-4 py-4 min-w-[200px]">{entry.material}</td>
              <td className="px-4 py-4 min-w-[200px]">{entry.obstacle}</td>
              <td className="px-4 py-4 min-w-[200px]">{entry.followUp}</td>
              <td className="px-4 py-4 min-w-[200px]">
                <AttendanceCell attendance={entry.attendance} />
              </td>
              <td className="px-4 py-4 min-w-[150px]">{entry.notes}</td>
              <td className="px-4 py-4">
                <div className="flex items-center justify-center gap-3">
                  <button onClick={() => onCopy(entry.id)} className="text-green-500 hover:text-green-700" title="Salin">
                    <CopyIcon className="w-5 h-5"/>
                  </button>
                  <button onClick={() => onEdit(entry.id)} className="text-blue-500 hover:text-blue-700" title="Edit">
                    <EditIcon className="w-5 h-5"/>
                  </button>
                  <button onClick={() => onDelete(entry.id)} className="text-red-500 hover:text-red-700" title="Hapus">
                    <Trash2Icon className="w-5 h-5"/>
                  </button>
                </div>
              </td>
            </tr>
          )) : (
            <tr>
                <td colSpan={11} className="text-center py-10 text-gray-500 dark:text-gray-400">
                    Belum ada data jurnal. Silakan tambahkan jurnal baru.
                </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default JournalTable;