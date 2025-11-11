import React, { useState, useEffect } from 'react';
import { JournalEntry, AttendanceRecord } from '../types';
import { CLASSES, HOURS_OPTIONS } from '../constants';
import { PlusCircleIcon, Trash2Icon, XIcon, ChevronUpIcon } from './Icons';

interface JournalEntryFormProps {
  onSubmit: (entry: Omit<JournalEntry, 'id'>) => void;
  onCancel: () => void;
  initialData: Partial<JournalEntry> | null;
}

const JournalEntryForm: React.FC<JournalEntryFormProps> = ({ onSubmit, onCancel, initialData }) => {
  const isEditing = !!(initialData && initialData.id);

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState(CLASSES[0]);
  const [hours, setHours] = useState<number[]>([]);
  const [material, setMaterial] = useState('');
  const [obstacle, setObstacle] = useState('');
  const [followUp, setFollowUp] = useState('');
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [notes, setNotes] = useState('');

  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentStatus, setNewStudentStatus] = useState<'S' | 'I' | 'A'>('S');

  useEffect(() => {
    if (initialData) {
      setDate(initialData.date || new Date().toISOString().split('T')[0]);
      setSelectedClass(initialData.class || CLASSES[0]);
      setHours(initialData.hours || []);
      setMaterial(initialData.material || '');
      setObstacle(initialData.obstacle || '');
      setFollowUp(initialData.followUp || '');
      setAttendance(initialData.attendance?.map(a => ({...a, id: Math.random().toString() })) || []);
      setNotes(initialData.notes || '');
    } else {
        // Reset form for "new"
        setDate(new Date().toISOString().split('T')[0]);
        setSelectedClass(CLASSES[0]);
        setHours([]);
        setMaterial('');
        setObstacle('');
        setFollowUp('');
        setAttendance([]);
        setNotes('');
    }
  }, [initialData]);


  const handleHourToggle = (hour: number) => {
    setHours(prev =>
      prev.includes(hour) ? prev.filter(h => h !== hour).sort((a,b) => a-b) : [...prev, hour].sort((a,b) => a-b)
    );
  };

  const handleAddAttendance = () => {
    if (newStudentName.trim()) {
      setAttendance(prev => [...prev, { id: Date.now().toString(), name: newStudentName.trim(), status: newStudentStatus }]);
      setNewStudentName('');
    }
  };

  const handleRemoveAttendance = (id: string) => {
    setAttendance(prev => prev.filter(a => a.id !== id));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !selectedClass || hours.length === 0 || !material) {
        alert('Mohon lengkapi kolom Hari/Tanggal, Kelas, Jam Ke, dan Materi/Kegiatan.');
        return;
    }
    onSubmit({ date, class: selectedClass, hours, material, obstacle, followUp, attendance, notes });
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl my-6 border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold">{isEditing ? 'Edit Jurnal' : 'Tambah Jurnal Baru'}</h2>
            <button onClick={onCancel} className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">
                <ChevronUpIcon className="w-6 h-6"/>
            </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="date">Hari, Tanggal</label>
            <input type="date" id="date" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="class">Kelas</label>
            <select id="class" value={selectedClass} onChange={e => setSelectedClass(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2" required>
              {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="md:col-span-3">
             <label className="block text-sm font-medium mb-2">Jam Ke</label>
             <div className="flex flex-wrap gap-2">
                {HOURS_OPTIONS.map(h => (
                    <button key={h} type="button" onClick={() => handleHourToggle(h)} className={`px-3 py-1 rounded-full text-sm font-semibold ${hours.includes(h) ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>
                        {h}
                    </button>
                ))}
             </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
                <label className="block text-sm font-medium mb-1" htmlFor="material">Materi / Kegiatan</label>
                <textarea id="material" value={material} onChange={e => setMaterial(e.target.value)} rows={3} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2" required></textarea>
            </div>
            <div className="lg:col-span-1">
                <label className="block text-sm font-medium mb-1" htmlFor="obstacle">Hambatan</label>
                <textarea id="obstacle" value={obstacle} onChange={e => setObstacle(e.target.value)} rows={3} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2"></textarea>
            </div>
            <div className="lg:col-span-1">
                <label className="block text-sm font-medium mb-1" htmlFor="followUp">Tindak Lanjut</label>
                <textarea id="followUp" value={followUp} onChange={e => setFollowUp(e.target.value)} rows={3} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2"></textarea>
            </div>
        </div>
        
        <div>
            <h3 className="text-lg font-semibold mb-2">Kehadiran Siswa (yang tidak hadir)</h3>
            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-4">
                    <input type="text" placeholder="Nama Siswa" value={newStudentName} onChange={e => setNewStudentName(e.target.value)} className="flex-grow bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2" />
                    <select value={newStudentStatus} onChange={e => setNewStudentStatus(e.target.value as 'S'|'I'|'A')} className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2">
                        <option value="S">Sakit (S)</option>
                        <option value="I">Izin (I)</option>
                        <option value="A">Alpa (A)</option>
                    </select>
                    <button type="button" onClick={handleAddAttendance} className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 flex items-center gap-1">
                        <PlusCircleIcon className="w-5 h-5" /> Tambah
                    </button>
                </div>
                <div className="space-y-2">
                    {attendance.map(a => (
                        <div key={a.id} className="flex justify-between items-center bg-white dark:bg-gray-800 p-2 rounded-md shadow-sm">
                            <div>
                                <span className="font-semibold">{a.name}</span>
                                <span className={`ml-2 text-xs font-bold px-2 py-1 rounded-full ${a.status === 'S' ? 'bg-yellow-200 text-yellow-800' : a.status === 'I' ? 'bg-blue-200 text-blue-800' : 'bg-red-200 text-red-800'}`}>
                                    {a.status}
                                </span>
                            </div>
                            <button type="button" onClick={() => handleRemoveAttendance(a.id)} className="text-red-500 hover:text-red-700">
                                <Trash2Icon className="w-5 h-5"/>
                            </button>
                        </div>
                    ))}
                    {attendance.length === 0 && <p className="text-sm text-gray-500 dark:text-gray-400">Tidak ada siswa yang tidak hadir.</p>}
                </div>
            </div>
        </div>

        <div>
            <label className="block text-sm font-medium mb-1" htmlFor="notes">Keterangan</label>
            <textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} rows={2} className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2"></textarea>
        </div>

        <div className="flex justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button type="button" onClick={onCancel} className="bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-200 px-4 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500">Batal</button>
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">{isEditing ? 'Simpan Perubahan' : 'Simpan Jurnal'}</button>
        </div>
      </form>
    </div>
  );
};

export default JournalEntryForm;