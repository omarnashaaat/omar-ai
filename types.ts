export enum MessageSender {
  USER = 'user',
  ASSISTANT = 'assistant',
}

export interface Message {
  id: string;
  text: string;
  sender: MessageSender;
  sources?: { uri: string; title: string }[];
  image?: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
}

export type Theme = 'light' | 'dark';