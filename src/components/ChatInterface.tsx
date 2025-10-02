import React, { useState } from 'react';
import { Send, Bot, User, FileText, Download } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Message } from '../types';

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Function to search for notes in the database
  const searchNotes = async (query: string) => {
    try {
      const searchTerms = query.toLowerCase().split(' ');
      const queryBuilder = supabase
        .from('notes')
        .select('*');

      // Build search conditions using correct column names
      const conditions = searchTerms.map(term =>
        `title.ilike.%${term}%,subject.ilike.%${term}%,category.ilike.%${term}%,year.ilike.%${term}%,semester.ilike.%${term}%,user_name.ilike.%${term}%`
      ).join(',');

      const { data, error } = await queryBuilder.or(conditions);
      console.log('Chatbot search result:', data, error);
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Search error:', error);
      return [];
    }
  };

  // Function to generate response based on found resources
  const generateResponse = (notes: Message[]): Message => {
    if (notes.length === 0) {
      return {
        id: Date.now().toString(),
        text: "I couldn't find any matching notes for your query. Please try being more specific about the subject, year, or semester you're looking for.",
        sender: 'bot',
        timestamp: new Date()
      };
    }

    const responseText = `I found ${notes.length} note${notes.length > 1 ? 's' : ''} that might help:\n\n` +
      notes.map(note => `📚 ${note.title}\n   Subject: ${note.subject}\n   Year: ${note.year}, Semester: ${note.semester}\n   Category: ${note.category}\n`).join('\n');

    return {
      id: Date.now().toString(),
      text: responseText,
      sender: 'bot',
      timestamp: new Date(),
      resources: notes.map(note => ({
        title: note.title,
        url: note.file_url
      }))
    };
  };

  // Function to handle sending messages
  const handleSend = async () => {
    if (!input.trim()) return;

    setIsLoading(true);

    // Create user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date(),
    };

    // Add user message to chat
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    // Search for matching notes
    const matchingNotes = await searchNotes(input);
    
    // Generate and add bot response
    const botMessage = generateResponse(matchingNotes);
    setTimeout(() => {
      setMessages(prev => [...prev, botMessage]);
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-2 sm:p-4 md:p-8">
      <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700 p-4 sm:p-6 md:p-8">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 text-center sm:text-left">EduBuddy Chat</h2>
        <div className="flex flex-col gap-4">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-400 mt-8">
                <Bot size={40} className="mx-auto mb-4 text-blue-500" />
                <p className="text-lg">Hi! I'm EduBuddy, your academic assistant.</p>
                <p className="text-sm mt-2">Ask me about syllabi, notes, or previous year papers!</p>
              </div>
            )}
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-2 ${
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.sender === 'bot' && (
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                    <Bot size={18} />
                  </div>
                )}
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    message.sender === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-100'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{message.text}</div>
                  {message.resources && (
                    <div className="mt-3 space-y-2">
                      {message.resources.map((resource, index) => (
                        <a
                          key={index}
                          href={resource.url}
                          className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <FileText size={16} />
                          <span className="flex-1">{resource.title}</span>
                          <Download size={16} />
                        </a>
                      ))}
                    </div>
                  )}
                  <div className="text-xs mt-1 opacity-70">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
                {message.sender === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                    <User size={18} />
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="border-t border-gray-700 p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask about syllabi, notes, or previous year papers..."
                className="flex-1 rounded-lg border border-gray-600 bg-gray-700 p-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={handleSend}
                disabled={isLoading}
                className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <Send size={20} />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}