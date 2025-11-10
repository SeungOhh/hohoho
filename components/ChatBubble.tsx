
import React from 'react';
import { ChatMessage } from '../types';
import { UserIcon, SparklesIcon } from './icons';

interface ChatBubbleProps {
  message: ChatMessage;
  isStreaming: boolean;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message, isStreaming }) => {
  const isUser = message.role === 'user';

  const formatText = (text: string) => {
    // A simple formatter for newlines and basic markdown-like bolding.
    return text
      .split('\n')
      .map((line, i) => (
        <React.Fragment key={i}>
          {line.split(/(\*\*.*?\*\*)/g).map((part, j) => 
            part.startsWith('**') && part.endsWith('**') ? 
            <strong key={j}>{part.slice(2, -2)}</strong> : 
            part
          )}
          <br />
        </React.Fragment>
      ));
  };


  return (
    <div className={`flex items-start gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isUser ? 'bg-blue-500' : 'bg-surface'}`}>
        {isUser ? <UserIcon className="w-5 h-5 text-white" /> : <SparklesIcon className="w-5 h-5 text-primary" />}
      </div>
      <div className={`max-w-xl md:max-w-2xl w-fit p-4 rounded-2xl ${isUser ? 'bg-primary/20 text-on-surface rounded-br-none' : 'bg-surface text-on-surface-variant rounded-bl-none'}`}>
        <div className="prose prose-invert max-w-none text-on-surface-variant">
            {message.parts.map((part, index) => {
                if (part.inlineData) {
                    const imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                    return <img key={index} src={imageUrl} alt="User upload" className="max-w-xs rounded-lg mb-2" />;
                }
                if (part.text) {
                    return (
                        <p key={index} className="m-0">
                            {formatText(part.text)}
                            {isStreaming && <span className="inline-block w-2 h-5 bg-on-surface-variant animate-blink ml-1"></span>}
                        </p>
                    );
                }
                return null;
            })}
        </div>
      </div>
    </div>
  );
};
