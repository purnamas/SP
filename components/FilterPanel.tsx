import React, { useState } from 'react';
import { JournalFilters } from '../types';
import { ChevronUpIcon, ChevronDownIcon, FilterIcon, RefreshCwIcon } from './Icons';
import { CLASSES } from '../constants';

interface FilterPanelProps {
  onApplyFilters: (filters: JournalFilters) => void;
  onResetFilters: () => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ onApplyFilters, onResetFilters }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [localFilters, setLocalFilters] = useState<JournalFilters>({
    startDate: '',
    endDate: '',
    class: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setLocalFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    onApplyFilters(localFilters);
  };

  const handleReset = () => {
    const emptyFilters = { startDate: '', endDate: '', class: '' };
    setLocalFilters(emptyFilters);
    onResetFilters();
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl my-6 border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center p-4 cursor-pointer" onClick={() => setIsCollapsed(!isCollapsed)}>
        <h2 className="text-xl font-bold">Filter Jurnal</h2>
        <button className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">
          {isCollapsed ? <ChevronDownIcon className="w-6 h-6"/> : <ChevronUpIcon className="w-6 h-6"/>}
        </button>
      </div>
      {!isCollapsed && (
        <form onSubmit={handleApply} className="p-6 pt-0">
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="startDate">Tanggal Mulai</label>
              <input type="date" id="startDate" name="startDate" value={localFilters.startDate} onChange={handleChange} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="endDate">Tanggal Akhir</label>
              <input type="date" id="endDate" name="endDate" value={localFilters.endDate} onChange={handleChange} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="class">Kelas</label>
              <select id="class" name="class" value={localFilters.class} onChange={handleChange} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2">
                <option value="">Semua Kelas</option>
                {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-4 pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
            <button type="button" onClick={handleReset} className="flex items-center gap-2 bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200 px-4 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500">
                <RefreshCwIcon className="w-5 h-5" />
                Reset Filter
            </button>
            <button type="submit" className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                <FilterIcon className="w-5 h-5" />
                Terapkan Filter
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default FilterPanel;