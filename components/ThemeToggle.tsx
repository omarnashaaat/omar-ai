import React from 'react';
import type { Theme } from '../types.ts';
import { SunIcon } from './icons/SunIcon';
import { MoonIcon } from './icons/MoonIcon';

interface ThemeToggleProps {
  theme: Theme;
  toggleTheme: () => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, toggleTheme }) => {
  return (
    <button
      onClick={toggleTheme}
      className="flex items-center justify-between w-full p-2 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
    >
      <span>
        {theme === 'light' ? 'الوضع النهاري' : 'الوضع الليلي'}
      </span>
      {theme === 'light' ? (
        <SunIcon className="w-5 h-5 text-yellow-500" />
      ) : (
        <MoonIcon className="w-5 h-5 text-blue-300" />
      )}
    </button>
  );
};
