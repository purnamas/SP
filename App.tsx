import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import JournalTable from './components/JournalTable';
import JournalEntryForm from './components/JournalEntryForm';
import TeacherInfoEditor from './components/TeacherInfoEditor';
import SchoolInfoEditor from './components/SchoolInfoEditor';
import FilterPanel from './components/FilterPanel';
import ConfirmModal from './components/ConfirmModal';
import DataManagementPanel from './components/DataManagementPanel';
import { JournalEntry, TeacherInfo, SchoolInfo, BackupData, JournalFilters } from './types';
import { generatePdf } from './services/pdfService';
import { generateExcel } from './services/excelService';
import * as dbService from './services/dbService';
import { PlusCircleIcon, PrinterIcon, XIcon, Trash2Icon, AlertTriangleIcon, DownloadIcon, UploadIcon } from './components/Icons';

const App: React.FC = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<JournalEntry[]>([]);
  const [selectedEntryIds, setSelectedEntryIds] = useState<string[]>([]);
  const [teacherInfo, setTeacherInfo] = useState<TeacherInfo>({
    name: 'Sigit Purnama, S.Pd.',
    subject: 'Informatika',
    nip: ''
  });
  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo>({
    schoolName: 'SMP NEGERI 2 KESUGIHAN',
    academicYear: '2025/2026',
    principalName: 'Rokaliana, S.Pd., M.Pd.',
    principalNip: '197210062008012005',
    printLocation: 'Kesugihan'
  });
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<Partial<JournalEntry> | null>(null);
  const [isPrintModalVisible, setIsPrintModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<JournalFilters>({ startDate: '', endDate: '', class: '' });
  const [confirmation, setConfirmation] = useState<{
    isOpen: boolean;
    title: string;
    message: React.ReactNode;
    onConfirm: () => void;
    onCancel?: () => void;
    confirmText: string;
    confirmColor?: 'blue' | 'green' | 'red' | 'yellow';
    icon?: React.ReactNode;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    confirmText: '',
  });


  // Load data from IndexedDB
  useEffect(() => {
    const loadData = async () => {
      try {
        const [savedEntries, savedTeacherInfo, savedSchoolInfo] = await Promise.all([
          dbService.getEntries(),
          dbService.getTeacherInfo(),
          dbService.getSchoolInfo()
        ]);
        
        const sortedEntries = savedEntries.sort((a,b) => a.date.localeCompare(b.date));
        setEntries(sortedEntries);
        
        if (savedTeacherInfo) {
          setTeacherInfo(savedTeacherInfo);
        }
        if (savedSchoolInfo) {
          setSchoolInfo(prev => ({ ...prev, ...savedSchoolInfo }));
        }
      } catch (error) {
        console.error("Failed to load data from IndexedDB", error);
        alert("Gagal memuat data dari database. Silakan coba muat ulang halaman.");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Apply filters whenever entries or filters change
  useEffect(() => {
    let result = [...entries];
    if (filters.startDate) {
        result = result.filter(e => e.date >= filters.startDate);
    }
    if (filters.endDate) {
        result = result.filter(e => e.date <= filters.endDate);
    }
    if (filters.class) {
        result = result.filter(e => e.class === filters.class);
    }
    setFilteredEntries(result);
  }, [entries, filters]);


  const handleAddNew = () => {
    setCurrentEntry(null);
    setIsFormVisible(true);
  };

  const handleEdit = (id: string) => {
    const entryToEdit = entries.find(e => e.id === id);
    if (entryToEdit) {
      setCurrentEntry(entryToEdit);
      setIsFormVisible(true);
    }
  };

  const handleCopy = (id: string) => {
    const entryToCopy = entries.find(e => e.id === id);
    if (entryToCopy) {
      const { id: _, ...entryData } = entryToCopy;
      setCurrentEntry({
        ...entryData,
        date: new Date().toISOString().split('T')[0] // Set date to today for copy
      });
      setIsFormVisible(true);
    }
  };

  const handleCancelForm = () => {
    setCurrentEntry(null);
    setIsFormVisible(false);
  };

  const handleFormSubmit = async (formData: Omit<JournalEntry, 'id'>) => {
    if (currentEntry && 'id' in currentEntry && currentEntry.id) { // It's an edit
      await updateEntry({ ...formData, id: currentEntry.id });
    } else { // It's a new entry from add or copy
      await addEntry(formData);
    }
    handleCancelForm();
  };


  const addEntry = async (entry: Omit<JournalEntry, 'id'>) => {
    const newEntry = { ...entry, id: new Date().toISOString() + Math.random() };
    try {
        await dbService.addEntry(newEntry);
        setEntries(prev => [...prev, newEntry].sort((a,b) => a.date.localeCompare(b.date)));
    } catch (error) {
        console.error("Failed to save entry to DB", error);
        alert("Gagal menyimpan jurnal ke database.");
    }
  };
  
  const updateEntry = async (entry: JournalEntry) => {
    try {
        await dbService.updateEntry(entry);
        setEntries(prev => prev.map(e => e.id === entry.id ? entry : e).sort((a,b) => a.date.localeCompare(b.date)));
    } catch (error) {
        console.error("Failed to update entry in DB", error);
        alert("Gagal memperbarui jurnal di database.");
    }
  }

  const deleteEntry = async (id: string) => {
    try {
        await dbService.deleteEntry(id);
        setEntries(prev => prev.filter(entry => entry.id !== id));
        setSelectedEntryIds(prev => prev.filter(selectedId => selectedId !== id)); // Deselect if deleted
    } catch (error) {
        console.error("Failed to delete entry from DB", error);
        alert("Gagal menghapus jurnal dari database.");
    }
  };
  
  const deleteSelectedEntries = async () => {
    try {
        await dbService.deleteMultipleEntries(selectedEntryIds);
        setEntries(prev => prev.filter(entry => !selectedEntryIds.includes(entry.id)));
        setSelectedEntryIds([]);
        alert('Jurnal yang dipilih berhasil dihapus.');
    } catch (error) {
        console.error("Failed to delete selected entries from DB", error);
        alert("Gagal menghapus jurnal yang dipilih dari database.");
    }
  };

  const closeConfirmation = () => {
    if (confirmation.onCancel) {
        confirmation.onCancel();
    }
    setConfirmation(prev => ({ ...prev, isOpen: false }));
  };

  const handleRequestDelete = (id: string) => {
    setConfirmation({
        isOpen: true,
        title: 'Konfirmasi Hapus',
        message: <p>Apakah Anda yakin ingin menghapus jurnal ini? Tindakan ini tidak dapat dibatalkan.</p>,
        onConfirm: async () => {
          await deleteEntry(id);
          closeConfirmation();
        },
        confirmText: 'Hapus',
        confirmColor: 'red',
        icon: <AlertTriangleIcon className="w-6 h-6 text-red-500" />
    });
  };
    
  const handleRequestDeleteSelected = () => {
    if (selectedEntryIds.length > 0) {
      setConfirmation({
        isOpen: true,
        title: 'Konfirmasi Hapus',
        message: <p>Apakah Anda yakin ingin menghapus <strong>{selectedEntryIds.length} jurnal</strong> yang dipilih? Tindakan ini tidak dapat dibatalkan.</p>,
        onConfirm: async () => {
          await deleteSelectedEntries();
          closeConfirmation();
        },
        confirmText: 'Hapus',
        confirmColor: 'red',
        icon: <AlertTriangleIcon className="w-6 h-6 text-red-500" />
      });
    }
  };
  
  const handleSaveTeacherInfo = async (info: TeacherInfo) => {
      try {
          await dbService.saveTeacherInfo(info);
          setTeacherInfo(info);
      } catch (error) {
          console.error("Failed to save teacher info to DB", error);
          alert("Gagal menyimpan informasi guru ke database.");
      }
  };

  const handleSaveSchoolInfo = async (info: SchoolInfo) => {
    try {
        await dbService.saveSchoolInfo(info);
        setSchoolInfo(info);
    } catch (error) {
        console.error("Failed to save school info to DB", error);
        alert("Gagal menyimpan informasi sekolah ke database.");
    }
  };

  const handleToggleSelection = (id: string) => {
    setSelectedEntryIds(prev =>
      prev.includes(id)
        ? prev.filter(selectedId => selectedId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = (select: boolean) => {
    if (select) {
      setSelectedEntryIds(filteredEntries.map(e => e.id));
    } else {
      setSelectedEntryIds([]);
    }
  };

  const getSortedSelectedEntries = () => {
    return entries
      .filter(entry => selectedEntryIds.includes(entry.id))
      .sort((a, b) => {
        const dateComparison = a.date.localeCompare(b.date);
        if (dateComparison !== 0) return dateComparison;
        
        const firstHourA = a.hours.length > 0 ? a.hours[0] : 0;
        const firstHourB = b.hours.length > 0 ? b.hours[0] : 0;
        return firstHourA - firstHourB;
      });
  }

  const handlePrint = (paperSize: 'A4' | 'Folio') => {
    const entriesToPrint = getSortedSelectedEntries();

    if (entriesToPrint.length === 0) {
        alert("Pilih setidaknya satu jurnal untuk dicetak.");
        return;
    }

    generatePdf(entriesToPrint, teacherInfo, schoolInfo, paperSize);
    setIsPrintModalVisible(false);
  };

  const handleDownloadExcel = () => {
    const entriesToExport = getSortedSelectedEntries();

    if (entriesToExport.length === 0) {
        alert("Pilih setidaknya satu jurnal untuk diekspor.");
        return;
    }

    generateExcel(entriesToExport, teacherInfo, schoolInfo);
    setIsPrintModalVisible(false);
  };


  const handleBackupDatabase = () => {
    setConfirmation({
        isOpen: true,
        title: 'Konfirmasi Backup',
        message: 'Anda akan mengunduh file cadangan dari seluruh data jurnal. Lanjutkan?',
        onConfirm: async () => {
            try {
                const dataToExport: BackupData = { entries, teacherInfo, schoolInfo };
                const jsonString = JSON.stringify(dataToExport, null, 2);
                const blob = new Blob([jsonString], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `jurnal-guru-backup-${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                alert('Data cadangan berhasil diekspor!');
            } catch (error) {
                console.error('Export failed:', error);
                alert('Gagal mengekspor data cadangan.');
            } finally {
                closeConfirmation();
            }
        },
        confirmText: 'Backup',
        confirmColor: 'yellow',
        icon: <DownloadIcon className="w-6 h-6 text-yellow-500" />
    });
  };

  const handleImportDatabaseFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    const fileInput = event.target;
    if (!file) return;

    const resetInput = () => {
      if (fileInput) fileInput.value = '';
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const text = e.target?.result;
            if (typeof text !== 'string') throw new Error('File content is not valid text.');
            
            const importedData: BackupData = JSON.parse(text);

            if (!importedData.entries || !importedData.teacherInfo || !importedData.schoolInfo) {
                throw new Error('Format file tidak valid.');
            }
            
            setConfirmation({
                isOpen: true,
                title: 'Konfirmasi Impor',
                message: (
                    <>
                        <p>Apakah Anda yakin ingin mengimpor data dari file <strong>{file.name}</strong>?</p>
                        <p className="mt-2 font-bold text-red-600 dark:text-red-400">TINDAKAN INI AKAN MENGHAPUS SEMUA DATA YANG ADA SAAT INI.</p>
                    </>
                ),
                onConfirm: async () => {
                    try {
                        await dbService.clearAllData();
                        await Promise.all(importedData.entries.map(entry => dbService.addEntry(entry)));
                        await dbService.saveTeacherInfo(importedData.teacherInfo);
                        await dbService.saveSchoolInfo(importedData.schoolInfo);

                        const sortedEntries = importedData.entries.sort((a,b) => a.date.localeCompare(b.date));
                        setEntries(sortedEntries);
                        setTeacherInfo(importedData.teacherInfo);
                        setSchoolInfo(importedData.schoolInfo);
                        
                        alert('Data cadangan berhasil diimpor!');
                    } catch (error) {
                        console.error('Import write failed:', error);
                        alert(`Gagal menyimpan data impor: ${error instanceof Error ? error.message : 'Unknown error'}`);
                    } finally {
                        closeConfirmation();
                        resetInput();
                    }
                },
                onCancel: resetInput,
                confirmText: 'Impor & Ganti',
                confirmColor: 'green',
                icon: <UploadIcon className="w-6 h-6 text-green-500" />
            });

        } catch (error) {
            console.error('Import failed:', error);
            alert(`Gagal mengimpor data: ${error instanceof Error ? error.message : 'Unknown error'}`);
            resetInput();
        }
    };
    reader.readAsText(file);
  };

  const PrintModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Pilih Format Unduh/Cetak</h3>
          <button onClick={() => setIsPrintModalVisible(false)} className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">
            <XIcon className="w-6 h-6"/>
          </button>
        </div>
        <div className="flex flex-col space-y-4">
          <button onClick={() => handlePrint('A4')} className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 text-lg">Cetak PDF (A4)</button>
          <button onClick={() => handlePrint('Folio')} className="w-full bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 text-lg">Cetak PDF (Folio)</button>
          <button onClick={handleDownloadExcel} className="w-full bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 text-lg">Unduh Excel (CSV)</button>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="text-xl">Memuat data...</div>
        </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-6">
        <Header 
            teacherName={teacherInfo.name} 
            subject={teacherInfo.subject}
            schoolName={schoolInfo.schoolName}
            academicYear={schoolInfo.academicYear}
        />
        
        <main className="mt-6">
          <TeacherInfoEditor initialInfo={teacherInfo} onSave={handleSaveTeacherInfo} />
          <SchoolInfoEditor initialInfo={schoolInfo} onSave={handleSaveSchoolInfo} />
          <DataManagementPanel onImport={handleImportDatabaseFileChange} onBackup={handleBackupDatabase} />
          <FilterPanel onApplyFilters={setFilters} onResetFilters={() => setFilters({ startDate: '', endDate: '', class: ''})} />

          <div className="flex flex-col md:flex-row gap-4 justify-end items-center mb-6">
            <div className="flex flex-wrap gap-4">
                {!isFormVisible && (
                <button onClick={handleAddNew} className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 transition-colors">
                    <PlusCircleIcon className="w-5 h-5"/>
                    <span>Tambah Jurnal Baru</span>
                </button>
                )}
                <button onClick={handleRequestDeleteSelected} className="flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed" disabled={selectedEntryIds.length === 0}>
                    <Trash2Icon className="w-5 h-5"/>
                    <span>Hapus Terpilih ({selectedEntryIds.length})</span>
                </button>
                <button onClick={() => setIsPrintModalVisible(true)} className="flex items-center justify-center gap-2 bg-gray-700 text-white px-4 py-2 rounded-lg shadow-md hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed" disabled={selectedEntryIds.length === 0}>
                    <PrinterIcon className="w-5 h-5"/>
                    <span>Cetak / Unduh ({selectedEntryIds.length})</span>
                </button>
            </div>
          </div>

          {isFormVisible && <JournalEntryForm 
            onSubmit={handleFormSubmit} 
            onCancel={handleCancelForm}
            initialData={currentEntry}
          />}
          
          <JournalTable 
            entries={filteredEntries} 
            onDelete={handleRequestDelete} 
            onEdit={handleEdit}
            onCopy={handleCopy}
            selectedEntryIds={selectedEntryIds}
            onToggleSelection={handleToggleSelection}
            onSelectAll={handleSelectAll}
          />
        </main>
      </div>
      {isPrintModalVisible && <PrintModal/>}
      <ConfirmModal
        isOpen={confirmation.isOpen}
        onClose={closeConfirmation}
        onConfirm={confirmation.onConfirm}
        title={confirmation.title}
        message={confirmation.message}
        confirmText={confirmation.confirmText}
        confirmColor={confirmation.confirmColor}
        icon={confirmation.icon}
    />
    </div>
  );
};

export default App;
