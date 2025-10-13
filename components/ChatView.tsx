import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI } from '@google/genai';
import type { Conversation, Message } from '../types.ts';
import { MessageSender } from '../types.ts';
import { MessageBubble } from './Message';
import { SendIcon } from './icons/SendIcon';

const PaperclipIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.122 2.122l7.81-7.81" />
  </svg>
);

const CloseIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

interface ChatViewProps {
  userName: string;
  conversation: Conversation;
  addMessage: (conversationId: string, message: Message) => void;
  updateAssistantMessageStream: (conversationId: string, chunk: string, messageId: string, sources?: {uri: string; title: string}[]) => void;
}

const TypingIndicator = () => (
    <div className="flex items-center space-x-2 rtl:space-x-reverse self-start">
        <div className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700">
            <div className="flex items-center justify-center space-x-1 rtl:space-x-reverse">
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
            </div>
        </div>
        <span className="text-sm text-gray-500 dark:text-gray-400">المساعد بيكتب...</span>
    </div>
);


export const ChatView: React.FC<ChatViewProps> = ({ userName, conversation, addMessage, updateAssistantMessageStream }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const aiRef = useRef<GoogleGenAI | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation.messages, isLoading]);

  useEffect(() => {
    if (imageFile) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setImageDataUrl(reader.result as string);
        };
        reader.readAsDataURL(imageFile);
    } else {
        setImageDataUrl(null);
    }
  }, [imageFile]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
    }
    e.target.value = '';
  };
  
  const removeImage = () => {
    setImageFile(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const fileToGenerativePart = async (file: File) => {
    const base64EncodedDataPromise = new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
      reader.readAsDataURL(file);
    });
    return {
      inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
    };
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !imageFile) || isLoading) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      text: input,
      sender: MessageSender.USER,
      image: imageDataUrl ?? undefined,
    };
    addMessage(conversation.id, userMessage);
    setInput('');
    setImageFile(null);
    setIsLoading(true);
    setError(null);
    
    try {
        if (!aiRef.current) {
            if (!process.env.API_KEY) {
                throw new Error("API_KEY environment variable not set.");
            }
            aiRef.current = new GoogleGenAI({ apiKey: process.env.API_KEY });
        }
        
        // FIX: Define a Part type to handle multimodal content and correctly type the `contents` array.
        // This resolves the TypeScript error and ensures chat history with images is correctly processed.
        type Part = { text: string } | { inlineData: { data: string; mimeType: string; } };

        const contents: { role: string; parts: Part[] }[] = conversation.messages.map(msg => {
            const parts: Part[] = [];
            
            if (msg.image) {
                const [meta, base64Data] = msg.image.split(',');
                if (base64Data) {
                    const mimeTypeMatch = meta.match(/data:(.*?);base64/);
                    const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'image/jpeg';
                    parts.push({ inlineData: { data: base64Data, mimeType } });
                }
            }
            
            if (msg.text) {
                parts.push({ text: msg.text });
            }

            return {
                role: msg.sender === 'user' ? 'user' : 'model',
                parts
            };
        });

        const userParts: Part[] = [];
        if (imageFile) {
            const imagePart = await fileToGenerativePart(imageFile);
            userParts.push(imagePart);
        }
        if (input.trim()) {
            userParts.push({ text: input });
        }
        contents.push({ role: 'user', parts: userParts });

        const result = await aiRef.current.models.generateContentStream({
            model: 'gemini-2.5-flash',
            contents,
            config: {
                systemInstruction: `أنت مساعد ذكي اسمك 'المصري'. تتحدث باللهجة المصرية العامية بأسلوب ودود ومرح ودمك خفيف. تعلم من المستخدم وتذكر اسمه (${userName}) وتفاصيل محادثاتكم السابقة. حلل مزاجه ورد بلطف. اقترح اقتراحات ذكية ومفيدة. استخدم إيموجيز مصرية مناسبة مثل 👑, 😎, ❤️, 🇪🇬. عند السؤال عن معلومات حديثة أو الطقس أو العملات، استخدم بحث جوجل وقدم إجابة مختصرة ومصادرها.`,
                tools: [{googleSearch: {}}]
            },
        });

        let assistantMessageId = `msg-assistant-${Date.now()}`;

        for await (const chunk of result) {
            const chunkText = chunk.text;
            if (chunkText) {
                const groundingChunks = chunk.candidates?.[0]?.groundingMetadata?.groundingChunks;
                const sources = groundingChunks?.map((c: any) => ({
                    uri: c.web.uri,
                    title: c.web.title,
                }));

                updateAssistantMessageStream(conversation.id, chunkText, assistantMessageId, sources);
            }
        }

    } catch (err: any) {
        console.error("Gemini API error:", err);
        setError(`حصلت مشكلة: ${err.message}. اتأكد من مفتاح الـ API.`);
        const errorMessage: Message = {
          id: `msg-error-${Date.now()}`,
          text: `آسف، حصلت مشكلة تقنية ومش هقدر أرد دلوقتي. 😟`,
          sender: MessageSender.ASSISTANT
        };
        addMessage(conversation.id, errorMessage);
    } finally {
        setIsLoading(false);
    }
  }, [input, imageFile, imageDataUrl, isLoading, addMessage, updateAssistantMessageStream, conversation.id, conversation.messages, userName]);

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {conversation.messages.length === 0 && !isLoading && (
              <div className="text-center text-gray-400 mt-20">
                  <h1 className="text-3xl font-bold">المساعد المصري الذكي 🇪🇬</h1>
                  <p className="mt-2">أهلاً يا {userName}! عامل إيه؟ اسألني أي حاجة!</p>
              </div>
          )}
        {conversation.messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        {isLoading && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        {error && <p className="text-red-500 text-center text-sm mb-2">{error}</p>}
        {imageDataUrl && (
            <div className="p-2 relative w-28 h-28 border border-gray-200 dark:border-gray-600 rounded-lg mb-2">
                <img src={imageDataUrl} alt="Preview" className="w-full h-full object-cover rounded-md" />
                <button 
                    onClick={removeImage} 
                    className="absolute top-0 right-0 -m-2 bg-gray-800 text-white rounded-full p-1 leading-none hover:bg-red-500 transition-colors" 
                    aria-label="Remove image"
                >
                    <CloseIcon className="w-4 h-4" />
                </button>
            </div>
        )}
        <form onSubmit={handleSubmit} className="flex items-center space-x-2 rtl:space-x-reverse">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            accept="image/*"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="p-3 text-gray-500 dark:text-gray-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
            aria-label="Attach image"
          >
            <PaperclipIcon className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="اكتب رسالتك هنا..."
            disabled={isLoading}
            className="flex-1 w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={isLoading || (!input.trim() && !imageFile)}
            className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:bg-blue-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
          >
            <SendIcon className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};
