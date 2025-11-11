export interface AttendanceRecord {
  id: string;
  name: string;
  status: 'S' | 'I' | 'A';
}

export interface JournalEntry {
  id: string;
  date: string;
  class: string;
  hours: number[];
  material: string;
  obstacle: string;
  followUp: string;
  attendance: AttendanceRecord[];
  notes: string;
}

export interface TeacherInfo {
  name: string;
  subject: string;
  nip: string;
}

export interface TeacherInfoDB {
    id: 'default';
    data: TeacherInfo;
}

export interface SchoolInfo {
  schoolName: string;
  academicYear: string;
  principalName: string;
  principalNip: string;
  printLocation: string;
}

export interface SchoolInfoDB {
  id: 'default';
  data: SchoolInfo;
}

export interface BackupData {
    entries: JournalEntry[];
    teacherInfo: TeacherInfo;
    schoolInfo: SchoolInfo;
}

export interface JournalFilters {
  startDate: string;
  endDate: string;
  class: string;
}
