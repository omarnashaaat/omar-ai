import React, { useState } from 'react';
import { GeminiIcon } from './icons/GeminiIcon';

interface LoginProps {
  onLogin: (name: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onLogin(name.trim());
    }
  };

  return (
    <div className="flex items-center justify-center h-screen w-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg text-center">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white">
            <GeminiIcon className="w-10 h-10" />
          </div>
        </div>
        <h1 className="text-3xl font-bold">المساعد المصري الذكي 🇪🇬</h1>
        <p className="text-gray-500 dark:text-gray-400">عشان أقدر أساعدك بشكل أفضل، قوللي اسمك إيه؟</p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="اكتب اسمك هنا..."
            className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
            required
            autoFocus
          />
          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full px-4 py-3 font-semibold text-white bg-blue-500 rounded-lg hover:bg-blue-600 disabled:bg-blue-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
          >
            يلا بينا!
          </button>
        </form>
      </div>
    </div>
  );
};
