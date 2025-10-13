import React from 'react';
import type { Conversation, Theme } from '../types.ts';
import { PlusIcon } from './icons/PlusIcon';
import { SearchIcon } from './icons/SearchIcon';
import { ThemeToggle } from './ThemeToggle';
import { ChatBubbleIcon } from './icons/ChatBubbleIcon';
import { UserIcon } from './icons/UserIcon';
import { LogoutIcon } from './icons/LogoutIcon';

interface SidebarProps {
  userName: string;
  onLogout: () => void;
  conversations: Conversation[];
  activeConversationId: string | null;
  onNewConversation: () => void;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  onSearch: (query: string) => void;
  theme: Theme;
  toggleTheme: () => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  userName,
  onLogout,
  conversations,
  activeConversationId,
  onNewConversation,
  onSelectConversation,
  onDeleteConversation,
  onSearch,
  theme,
  toggleTheme,
  isOpen,
  setIsOpen,
}) => {
  return (
    <>
      <div className={`fixed lg:relative inset-y-0 right-0 z-30 flex flex-col h-full w-64 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'} lg:translate-x-0`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={onNewConversation}
            className="flex items-center gap-2 w-full p-2 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            محادثة جديدة
          </button>
        </div>
        
        <div className="p-4">
          <div className="relative">
            <input
              type="text"
              placeholder="ابحث في المحادثات..."
              onChange={(e) => onSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 pb-4">
          <h3 className="px-2 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">المحادثات</h3>
          <ul className="mt-2 space-y-2">
            {conversations.map((conv) => (
              <li key={conv.id}>
                <div
                  onClick={() => onSelectConversation(conv.id)}
                  className={`flex items-center justify-between p-2 rounded-lg cursor-pointer group ${
                    activeConversationId === conv.id ? 'bg-blue-500 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                     <ChatBubbleIcon className="w-5 h-5" />
                     <span className="truncate text-sm font-medium">{conv.title}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteConversation(conv.id);
                    }}
                    className={`text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity ${activeConversationId === conv.id ? 'text-white/70 hover:text-white opacity-100' : ''}`}
                  >
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="p-2 border-t border-gray-200 dark:border-gray-700 space-y-2">
          <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
          <div className="flex items-center justify-between w-full p-2 rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                  <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                      <UserIcon className="w-4 h-4 text-gray-600 dark:text-gray-300"/>
                  </div>
                  <span className="font-semibold">{userName}</span>
              </div>
              <button onClick={onLogout} title="تسجيل الخروج" className="p-1 text-gray-500 hover:text-red-500 dark:hover:text-red-400 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <LogoutIcon className="w-5 h-5" />
              </button>
          </div>
        </div>
      </div>
      {isOpen && <div onClick={() => setIsOpen(false)} className="fixed inset-0 bg-black/30 z-20 lg:hidden"></div>}
    </>
  );
};
