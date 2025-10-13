import React from 'react';
import type { Message } from '../types.ts';
import { MessageSender } from '../types.ts';
import { UserIcon } from './icons/UserIcon';
import { GeminiIcon } from './icons/GeminiIcon';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.sender === MessageSender.USER;

  const formatText = (text: string) => {
    const lines = text.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        <br />
      </React.Fragment>
    ));
    return <p>{lines}</p>;
  };

  return (
    <div className={`flex items-start gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white">
            <GeminiIcon className="w-5 h-5" />
        </div>
      )}

      <div className={`max-w-xl ${isUser ? 'order-1' : 'order-2'}`}>
        <div
          className={`px-4 py-3 rounded-2xl shadow-sm ${
            isUser
              ? 'bg-blue-500 text-white rounded-br-none'
              : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'
          }`}
        >
          {message.image && (
            <img 
              src={message.image} 
              alt="User upload" 
              className="rounded-lg mb-2 max-w-xs max-h-64 object-contain"
            />
          )}
          <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
            {formatText(message.text)}
          </div>
        </div>
        {message.sources && message.sources.length > 0 && (
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                <h4 className="font-semibold mb-1">المصادر:</h4>
                <ul className="list-disc list-inside space-y-1">
                {message.sources.map((source, index) => (
                    <li key={index} className="truncate">
                        <a 
                            href={source.uri} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-blue-500 hover:underline"
                        >
                            {source.title || source.uri}
                        </a>
                    </li>
                ))}
                </ul>
            </div>
        )}
      </div>

      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center order-2">
            <UserIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </div>
      )}
    </div>
  );
};