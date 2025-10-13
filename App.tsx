import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatView } from './components/ChatView';
import { SearchView } from './components/SearchView';
import { Login } from './components/Login';
import type { Conversation, Theme, Message } from './types.ts';
import { MessageSender } from './types.ts';

const App: React.FC = () => {
  const [theme, setTheme] = useState<Theme>('dark');
  const [userName, setUserName] = useState<string | null>(null);
  const [isLoadingApp, setIsLoadingApp] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'chat' | 'search'>('chat');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const savedUserName = localStorage.getItem('userName');
    if (savedUserName) {
      setUserName(savedUserName);
    }
      
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
       const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
       setTheme(prefersDark ? 'dark' : 'light');
    }

    try {
      const savedConversations = localStorage.getItem('conversations');
      if (savedConversations) {
        const parsedConversations: Conversation[] = JSON.parse(savedConversations);
        if (parsedConversations.length > 0) {
            setConversations(parsedConversations);
            setActiveConversationId(parsedConversations[0].id);
        } else {
            handleNewConversation();
        }
      } else {
        handleNewConversation();
      }
    } catch (error) {
      console.error("Failed to load conversations from localStorage:", error);
      handleNewConversation();
    } finally {
        setIsLoadingApp(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    if (!isLoadingApp) {
        localStorage.setItem('conversations', JSON.stringify(conversations));
    }
  }, [conversations, isLoadingApp]);

  const handleLogin = useCallback((name: string) => {
    setUserName(name);
    localStorage.setItem('userName', name);
  }, []);
  
  const handleLogout = useCallback(() => {
    setUserName(null);
    localStorage.removeItem('userName');
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  }, []);

  const handleNewConversation = useCallback(() => {
    const newConversation: Conversation = {
      id: `conv-${Date.now()}`,
      title: 'محادثة جديدة',
      messages: [],
    };
    setConversations(prev => [newConversation, ...prev]);
    setActiveConversationId(newConversation.id);
    setViewMode('chat');
  }, []);

  const selectConversation = useCallback((id: string) => {
    setActiveConversationId(id);
    setViewMode('chat');
  }, []);
  
  const deleteConversation = useCallback((id: string) => {
    setConversations(prev => {
        const newConversations = prev.filter(c => c.id !== id);
        if (activeConversationId === id) {
            if (newConversations.length > 0) {
                setActiveConversationId(newConversations[0].id);
            } else {
                handleNewConversation();
            }
        }
        return newConversations;
    });
  }, [activeConversationId, handleNewConversation]);


  const addMessageToConversation = useCallback((conversationId: string, message: Message) => {
      setConversations(prev => 
          prev.map(conv => {
              if (conv.id === conversationId) {
                  const updatedMessages = [...conv.messages, message];
                  const newTitle = conv.messages.length === 0 && message.sender === MessageSender.USER 
                      ? message.text.substring(0, 30) 
                      : conv.title;
                  return { ...conv, title: newTitle, messages: updatedMessages };
              }
              return conv;
          })
      );
  }, []);

  const updateAssistantMessageStream = useCallback((conversationId: string, chunk: string, messageId: string, sources?: { uri: string; title: string }[]) => {
      setConversations(prev =>
          prev.map(conv => {
              if (conv.id === conversationId) {
                  const newMessages = [...conv.messages];
                  const lastMessage = newMessages[newMessages.length - 1];

                  if (lastMessage && lastMessage.id === messageId && lastMessage.sender === MessageSender.ASSISTANT) {
                      lastMessage.text += chunk;
                      if (sources) {
                        lastMessage.sources = sources;
                      }
                  } else {
                       newMessages.push({ id: messageId, text: chunk, sender: MessageSender.ASSISTANT, sources });
                  }
                  return { ...conv, messages: newMessages };
              }
              return conv;
          })
      );
  }, []);

  const activeConversation = useMemo(() => {
    return conversations.find((c) => c.id === activeConversationId);
  }, [conversations, activeConversationId]);
  
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    if(query) {
      setViewMode('search');
    } else {
      setViewMode('chat');
    }
  }, []);

  if (isLoadingApp) {
      return <div className="flex h-screen w-screen bg-gray-100 dark:bg-gray-900" />; // Or a spinner
  }

  if (!userName) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen w-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 overflow-hidden">
        <Sidebar
            userName={userName}
            onLogout={handleLogout}
            conversations={conversations}
            activeConversationId={activeConversationId}
            onNewConversation={handleNewConversation}
            onSelectConversation={selectConversation}
            onDeleteConversation={deleteConversation}
            onSearch={handleSearch}
            theme={theme}
            toggleTheme={toggleTheme}
            isOpen={isSidebarOpen}
            setIsOpen={setSidebarOpen}
        />
        <main className="flex-1 flex flex-col transition-all duration-300">
            <div className="flex-shrink-0 lg:hidden p-2 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <button onClick={() => setSidebarOpen(!isSidebarOpen)}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
            </div>
            {viewMode === 'chat' && activeConversation ? (
                <ChatView
                    userName={userName}
                    conversation={activeConversation}
                    addMessage={addMessageToConversation}
                    updateAssistantMessageStream={updateAssistantMessageStream}
                />
            ) : (
                <SearchView 
                    conversations={conversations} 
                    query={searchQuery}
                    onSelectConversation={selectConversation}
                />
            )}
        </main>
    </div>
  );
};

export default App;
