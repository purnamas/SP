import React from 'react';

interface HeaderProps {
  teacherName: string;
  subject: string;
  schoolName: string;
  academicYear: string;
}

const Header: React.FC<HeaderProps> = ({ teacherName, subject, schoolName, academicYear }) => {
  return (
    <header className="text-center p-4 md:p-6 border-b border-gray-200 dark:border-gray-700">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">JURNAL KEGIATAN GURU</h1>
      <h2 className="text-xl md:text-2xl font-semibold text-gray-700 dark:text-gray-300">{schoolName}</h2>
      <p className="text-md md:text-lg text-gray-600 dark:text-gray-400">TAHUN AJARAN {academicYear}</p>
      <div className="mt-4 text-left inline-block">
        <p className="text-sm md:text-base"><span className="font-semibold">NAMA GURU</span>: {teacherName}</p>
        <p className="text-sm md:text-base"><span className="font-semibold">MATA PELAJARAN</span>: {subject}</p>
      </div>
    </header>
  );
};

export default Header;
