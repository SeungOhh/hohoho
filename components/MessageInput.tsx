
import React, { useState, useRef, KeyboardEvent, ChangeEvent } from 'react';
import { SendIcon, PaperclipIcon, XIcon } from './icons';

interface MessageInputProps {
  onSendMessage: (text: string, image: File | null) => void;
  isLoading: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, isLoading }) => {
  const [text, setText] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setText(e.target.value);
      adjustTextareaHeight();
  };


  const handleSend = () => {
    if (isLoading || (!text.trim() && !image)) return;
    onSendMessage(text, image);
    setText('');
    handleRemoveImage();
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-surface rounded-2xl p-2 flex flex-col items-start border border-gray-700/50 focus-within:border-primary transition-colors duration-200">
      {imagePreview && (
        <div className="relative ml-4 mb-2">
          <img src={imagePreview} alt="Image preview" className="h-20 w-20 rounded-lg object-cover" />
          <button
            onClick={handleRemoveImage}
            className="absolute -top-2 -right-2 bg-gray-800 rounded-full p-1 text-on-surface-variant hover:bg-gray-700 hover:text-on-surface"
          >
            <XIcon className="h-4 w-4" />
          </button>
        </div>
      )}
      <div className="flex w-full items-end">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          className="p-3 text-on-surface-variant hover:text-primary focus:text-primary rounded-full transition-colors duration-200 disabled:opacity-50"
        >
          <PaperclipIcon className="h-6 w-6" />
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*"
          />
        </button>
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          placeholder="Message Gemini..."
          rows={1}
          disabled={isLoading}
          className="flex-1 bg-transparent resize-none p-2 text-on-surface placeholder-on-surface-variant focus:outline-none max-h-48"
        />
        <button
          onClick={handleSend}
          disabled={isLoading || (!text.trim() && !image)}
          className="p-3 text-on-surface-variant hover:text-primary focus:text-primary rounded-full transition-colors duration-200 disabled:opacity-50 disabled:hover:text-on-surface-variant"
        >
          <SendIcon className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
};
