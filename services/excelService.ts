import { JournalEntry, TeacherInfo, SchoolInfo, AttendanceRecord } from '../types';
import * as XLSX from 'xlsx';

const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    const parts = dateString.split('-').map(s => parseInt(s, 10));
    const date = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));

    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const dayName = days[date.getUTCDay()];
    return `${dayName}, ${date.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}`;
};

const formatSignatureDate = (dateString: string) => {
    if (!dateString) return '';
    const parts = dateString.split('-').map(s => parseInt(s, 10));
    const date = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
    return date.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
}

const formatAttendance = (attendance: AttendanceRecord[]): string => {
    if (attendance.length === 0) return 'Hadir Semua';

    const s = attendance.filter(a => a.status === 'S').map(a => a.name).join(', ');
    const i = attendance.filter(a => a.status === 'I').map(a => a.name).join(', ');
    const a = attendance.filter(a => a.status === 'A').map(a => a.name).join(', ');

    const parts: string[] = [];
    if (s) parts.push(`S: ${s}`);
    if (i) parts.push(`I: ${i}`);
    if (a) parts.push(`A: ${a}`);
    
    return parts.join('\n');
};

export const generateExcel = (entries: JournalEntry[], teacherInfo: TeacherInfo, schoolInfo: SchoolInfo) => {
    const tableHeaders = [
        'NO', 'HARI, TANGGAL', 'KELAS', 'JAM KE', 'MATERI/KEGIATAN', 
        'HAMBATAN', 'TINDAK LANJUT', 'KEHADIRAN SISWA', 'KETERANGAN'
    ];

    const tableData = entries.map((entry, index) => {
        return [
          index + 1,
          formatDate(entry.date),
          entry.class,
          entry.hours.join(', '),
          entry.material,
          entry.obstacle,
          entry.followUp,
          formatAttendance(entry.attendance),
          entry.notes
        ];
    });

    // Create worksheet data array
    const ws_data: any[][] = [
        ['JURNAL KEGIATAN GURU'],
        [schoolInfo.schoolName],
        [`TAHUN AJARAN ${schoolInfo.academicYear}`],
        [], // Blank row
        ['NAMA GURU', `: ${teacherInfo.name}`],
        ['MATA PELAJARAN', `: ${teacherInfo.subject}`],
        [], // Blank row
        tableHeaders,
        ...tableData
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(ws_data);

    // Define column widths
    const columnWidths = [
        { wch: 5 },   // NO
        { wch: 25 },  // HARI, TANGGAL
        { wch: 10 },  // KELAS
        { wch: 10 },  // JAM KE
        { wch: 40 },  // MATERI/KEGIATAN
        { wch: 40 },  // HAMBATAN
        { wch: 40 },  // TINDAK LANJUT
        { wch: 30 },  // KEHADIRAN SISWA
        { wch: 30 },  // KETERANGAN
    ];
    ws['!cols'] = columnWidths;

    // Define merges
    const merges = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 8 } }, // JURNAL KEGIATAN GURU
        { s: { r: 1, c: 0 }, e: { r: 1, c: 8 } }, // School Name
        { s: { r: 2, c: 0 }, e: { r: 2, c: 8 } }, // Academic Year
    ];

    // Add signature block
    const tableEndRow = 7 + tableData.length + 1; // 7 rows before table + headers + data + 1 blank
    const latestEntryDate = entries.length > 0 ? entries[entries.length - 1].date : new Date().toISOString().split('T')[0];

    XLSX.utils.sheet_add_aoa(ws, [[]], { origin: -1 }); // Add a blank row
    XLSX.utils.sheet_add_aoa(ws, [['Mengetahui', '', '', '', '', '', '', `${schoolInfo.printLocation}, ${formatSignatureDate(latestEntryDate)}`]], { origin: -1 });
    // Fix: Replaced 'Waka Kurikulum' with 'Kepala Sekolah' and used 'principalName' and 'principalNip'
    // from schoolInfo to fix missing property errors and maintain consistency with PDF generation.
    XLSX.utils.sheet_add_aoa(ws, [['Kepala Sekolah', '', '', '', '', '', '', 'Guru Mata Pelajaran']], { origin: -1 });
    XLSX.utils.sheet_add_aoa(ws, [[]], { origin: -1 });
    XLSX.utils.sheet_add_aoa(ws, [[]], { origin: -1 });
    XLSX.utils.sheet_add_aoa(ws, [[]], { origin: -1 });
    XLSX.utils.sheet_add_aoa(ws, [[schoolInfo.principalName, '', '', '', '', '', '', teacherInfo.name]], { origin: -1 });
    XLSX.utils.sheet_add_aoa(ws, [[`NIP ${schoolInfo.principalNip || ''}`, '', '', '', '', '', '', `NIP ${teacherInfo.nip || ''}`]], { origin: -1 });

    merges.push({ s: { r: tableEndRow + 1, c: 7 }, e: { r: tableEndRow + 1, c: 8 } }); // Date merge
    merges.push({ s: { r: tableEndRow + 2, c: 7 }, e: { r: tableEndRow + 2, c: 8 } }); // Teacher title merge
    merges.push({ s: { r: tableEndRow + 6, c: 7 }, e: { r: tableEndRow + 6, c: 8 } }); // Teacher name merge
    merges.push({ s: { r: tableEndRow + 7, c: 7 }, e: { r: tableEndRow + 7, c: 8 } }); // Teacher NIP merge
    
    ws['!merges'] = merges;
    
    XLSX.utils.book_append_sheet(wb, ws, 'Jurnal');

    XLSX.writeFile(wb, `Jurnal Mengajar - ${teacherInfo.name}.xlsx`);
};