import React, { useState } from 'react';
import { MessageSquare, FileText, Brain } from 'lucide-react';
import { ChatInterface } from './components/ChatInterface';
import { NoteSharing } from './components/NoteSharing';
import { testSupabaseConnection } from './lib/supabase';

testSupabaseConnection();

function App() {
  const [activeTab, setActiveTab] = useState<'chat' | 'notes'>('chat');

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header with centered logo and slogan */}
      <header className="bg-gray-800 shadow-lg border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12 text-center">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
            <Brain size={48} className="text-blue-500" />
            <h1 className="text-4xl sm:text-5xl font-bold text-white bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
              EduBuddy
            </h1>
          </div>
          <p className="text-lg sm:text-xl text-gray-400 font-medium">Your Study Partner 24/7</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
        {/* Navigation Tabs */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-6">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-all text-base sm:text-lg w-full sm:w-auto justify-center ${
              activeTab === 'chat'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <MessageSquare size={20} />
            Chat with EduBuddy
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-lg transition-all text-base sm:text-lg w-full sm:w-auto justify-center ${
              activeTab === 'notes'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <FileText size={20} />
            Study Notes
          </button>
        </div>

        {/* Content Area */}
        <div className="container mx-auto px-0 sm:px-2">
          {activeTab === 'chat' ? <ChatInterface /> : <NoteSharing />}
        </div>
      </main>
    </div>
  );
}

export default App;