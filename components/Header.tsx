
import React from 'react';
import { PageName } from '../App';
import { PAGE_TITLES } from '../constants';
import { Button } from './Button';

interface HeaderProps {
  appName: string;
  currentPage: PageName;
  setIsSidebarOpen: (isOpen: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({ appName, currentPage, setIsSidebarOpen }) => {
  return (
    <header className="flex items-center justify-between bg-white shadow-md p-4 sm:p-6 sticky top-0 z-10">
      <div className="flex items-center">
        <Button
          onClick={() => setIsSidebarOpen(true)}
          className="md:hidden text-gray-500 hover:text-gray-700 mr-4"
          aria-label="Open sidebar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </Button>
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 hidden md:block">{appName}</h2>
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-800 ml-4 md:ml-8">{PAGE_TITLES[currentPage]}</h1>
      </div>
      <div className="flex items-center space-x-4">
        {/* User profile / notifications can go here */}
        <span className="text-gray-700 text-sm sm:text-base">Admin User</span>
        <img
          src="https://picsum.photos/40/40"
          alt="User Avatar"
          className="h-8 w-8 rounded-full border-2 border-blue-400"
        />
      </div>
    </header>
  );
};
