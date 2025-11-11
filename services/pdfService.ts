import { JournalEntry, TeacherInfo, SchoolInfo, AttendanceRecord } from '../types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const formatDate = (dateString: string) => {
    if (!dateString) return '';
    // Fix: Create date as UTC to avoid timezone issues
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

const drawSignatureFooter = (doc: jsPDF, teacherInfo: TeacherInfo, schoolInfo: SchoolInfo, signatureDate: string) => {
    const pageHeight = doc.internal.pageSize.getHeight();
    const signatureY = pageHeight - 50; // Position 50mm from bottom

    const leftX = 20;
    const rightX = doc.internal.pageSize.getWidth() - 20;

    doc.setFontSize(10);
    doc.text('Mengetahui', leftX, signatureY);
    doc.text(`${schoolInfo.printLocation}, ${formatSignatureDate(signatureDate)}`, rightX, signatureY, { align: 'right' });
    doc.text('Kepala Sekolah', leftX, signatureY + 5);
    doc.text('Guru Mata Pelajaran', rightX, signatureY + 5, { align: 'right' });

    doc.text(schoolInfo.principalName, leftX, signatureY + 25);
    doc.setFont('times', 'bold');
    doc.text('____________________', leftX, signatureY + 25.5);
    doc.setFont('times', 'normal');
    doc.text(schoolInfo.principalNip ? `NIP ${schoolInfo.principalNip}`: '', leftX, signatureY + 30);
    
    doc.text(teacherInfo.name, rightX, signatureY + 25, { align: 'right' });
    doc.setFont('times', 'bold');
    doc.text('____________________', rightX, signatureY + 25.5, {
      align: 'right'
    });
    doc.setFont('times', 'normal');
    doc.text(teacherInfo.nip ? `NIP ${teacherInfo.nip}` : '', rightX, signatureY + 30, { align: 'right' });
}


export const generatePdf = (entries: JournalEntry[], teacherInfo: TeacherInfo, schoolInfo: SchoolInfo, paperSize: 'A4' | 'Folio') => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: paperSize === 'A4' ? 'a4' : [215, 330] // Folio portrait
  });

  doc.setFont('times', 'bold');
  doc.setFontSize(14);
  doc.text('JURNAL KEGIATAN GURU', doc.internal.pageSize.getWidth() / 2, 10, { align: 'center' });
  
  doc.setFont('times', 'normal');
  doc.setFontSize(12);
  doc.text(schoolInfo.schoolName, doc.internal.pageSize.getWidth() / 2, 16, { align: 'center' });
  doc.text(`TAHUN AJARAN ${schoolInfo.academicYear}`, doc.internal.pageSize.getWidth() / 2, 22, { align: 'center' });

  doc.setFontSize(10);
  doc.text(`NAMA GURU      : ${teacherInfo.name}`, 15, 30);
  doc.text(`MATA PELAJARAN : ${teacherInfo.subject}`, 15, 35);


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
  
  const latestEntryDate = entries.length > 0 ? entries[entries.length - 1].date : new Date().toISOString().split('T')[0];

  autoTable(doc, {
    head: [['NO', 'HARI, TANGGAL', 'KELAS', 'JAM KE', 'MATERI/KEGIATAN', 'HAMBATAN', 'TINDAK LANJUT', 'KEHADIRAN SISWA', 'KETERANGAN']],
    body: tableData,
    startY: 40,
    theme: 'grid',
    styles: {
        font: 'times',
        fontSize: 8, // Adjusted body font size as per user request
        cellPadding: 2,
        lineColor: [0, 0, 0],
        lineWidth: 0.1,
    },
    headStyles: {
        fillColor: [220, 220, 220],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        halign: 'center',
        fontSize: 9, // Reduced header font size to prevent wrapping
    },
    columnStyles: {
        0: { halign: 'center', cellWidth: 8 },
        2: { halign: 'center', cellWidth: 12 },
        3: { halign: 'center', cellWidth: 12 },
    },
    margin: { bottom: 65 }, // Reserve space for the footer
    didDrawPage: (data: any) => {
        // Draw footer on every page
        drawSignatureFooter(doc, teacherInfo, schoolInfo, latestEntryDate);
    },
    didDrawCell: (data: any) => {
        if (data.section === 'body') {
            const td = data.cell.raw;
            if(td.styles) {
              td.styles.valign = 'middle';
            }
        }
    },
  });

  doc.save(`Jurnal Mengajar - ${teacherInfo.name}.pdf`);
};