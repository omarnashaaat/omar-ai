import React from 'react';
import type { Conversation, Message } from '../types.ts';
import { SearchIcon } from './icons/SearchIcon';
import { MessageSender } from '../types.ts';

interface SearchViewProps {
  conversations: Conversation[];
  query: string;
  onSelectConversation: (id: string) => void;
}

interface SearchResult {
    conversationId: string;
    conversationTitle: string;
    message: Message;
}

export const SearchView: React.FC<SearchViewProps> = ({ conversations, query, onSelectConversation }) => {
    const searchResults = React.useMemo(() => {
        if (!query) return [];
        const results: SearchResult[] = [];
        conversations.forEach(conv => {
            conv.messages.forEach(msg => {
                if(msg.text.toLowerCase().includes(query.toLowerCase())) {
                    results.push({
                        conversationId: conv.id,
                        conversationTitle: conv.title,
                        message: msg
                    });
                }
            });
        });
        return results;
    }, [query, conversations]);


    if (!query) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <SearchIcon className="w-16 h-16 mb-4" />
                <h2 className="text-xl font-semibold">ابحث في محادثاتك السابقة</h2>
                <p>اكتب في مربع البحث اللي في الجنب عشان تلاقي اللي بتدور عليه.</p>
            </div>
        );
    }
    
    return (
        <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
            <header className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h1 className="text-xl font-semibold">
                    نتائج البحث عن: <span className="text-blue-500">"{query}"</span>
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    تم العثور على {searchResults.length} نتيجة.
                </p>
            </header>
            <div className="flex-1 overflow-y-auto p-6">
                {searchResults.length > 0 ? (
                    <div className="space-y-4">
                        {searchResults.map((result, index) => (
                           <div key={`${result.conversationId}-${result.message.id}-${index}`} 
                                 onClick={() => onSelectConversation(result.conversationId)}
                                 className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md cursor-pointer transition-shadow">
                                <p className="text-sm font-semibold text-blue-500 dark:text-blue-400 mb-1">{result.conversationTitle}</p>
                                <div className="flex items-start gap-3">
                                    <span className="text-sm font-bold text-gray-600 dark:text-gray-300">
                                        {result.message.sender === MessageSender.USER ? "أنت:" : "المساعد:"}
                                    </span>
                                    <p className="text-sm text-gray-700 dark:text-gray-200 line-clamp-3">
                                        {result.message.text}
                                    </p>
                                </div>
                           </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 text-center">
                        <p className="text-lg">مفيش نتائج للبحث ده.</p>
                        <p className="text-sm">حاول تدور بكلمة تانية.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
