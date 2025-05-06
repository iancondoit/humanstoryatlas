"use client";

/**
 * Jordi Chat Interface
 * 
 * NOTE: This component contains MOCK DATA that should be replaced with real data in production.
 * All mock data is clearly marked with [MOCK] or [MOCK DATA] prefixes.
 * These examples should NOT be considered real data - they are for development/testing only.
 */

import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader2, FilmIcon, ChevronLeft } from 'lucide-react';
import { sendMessageToJordi, type JordiMessage, type StoryPitch } from '@/lib/jordi';

interface JordiChatProps {
  filters: {
    publication: string;
    startDate: string;
    endDate: string;
  };
  hasFilterApplied: boolean;
  userInput: string;
  setUserInput: (input: string) => void;
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

interface ConversationTurn {
  userMessage: JordiMessage;
  assistantMessage: JordiMessage;
  pitches: StoryPitch[];
  timestamp: Date;
}

const JordiChat: React.FC<JordiChatProps> = ({
  filters,
  hasFilterApplied,
  userInput,
  setUserInput,
  onSendMessage,
  isLoading: externalIsLoading
}) => {
  const [messages, setMessages] = useState<JordiMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>([
    "Find the biggest scandal in this dataset",
    "What's the most shocking crime story here?",
    "Show me controversies that would make great true crime series",
    "Find stories with corruption and cover-ups",
    "What salacious stories would captivate modern viewers?"
  ]);
  const [currentPitches, setCurrentPitches] = useState<StoryPitch[]>([]);
  const [conversationHistory, setConversationHistory] = useState<ConversationTurn[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [initialWelcomeMessage, setInitialWelcomeMessage] = useState<JordiMessage | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const conversationEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages, currentPitches, selectedConversation]);
  
  // Query Jordi API when publication is selected
  useEffect(() => {
    if (!hasFilterApplied || !filters.publication) return;
    
    // Reset UI state
    setMessages([]);
    setCurrentPitches([]);
    setConversationHistory([]);
    setSelectedConversation(null);
    setInitialWelcomeMessage(null);
    setIsLoading(true);
    
    // Get initial pitches from Jordi
    const fetchInitialPitches = async () => {
      try {
        const response = await sendMessageToJordi(
          filters.publication,
          filters.startDate,
          filters.endDate,
          []
        );
        
        if (response.message) {
          setMessages([response.message]);
          setInitialWelcomeMessage(response.message);
        }
        
        if (response.pitches && response.pitches.length > 0) {
          console.log('DISPLAYING REAL DATA: Retrieved', response.pitches.length, 'real stories from database.');
          setCurrentPitches(response.pitches);
        } else {
          // If we get a response but no pitches, show a helpful message
          console.warn('No pitches returned from API - but not using mock data');
          setMessages([{
            role: 'assistant',
            content: `I've analyzed the ${filters.publication} archive but couldn't find compelling narrative threads. Try adjusting your date range or ask me a specific question about this archive.`
          }]);
        }
      } catch (error) {
        console.error('Error fetching initial pitches:', error);
        setMessages([{
          role: 'assistant',
          content: 'I encountered an error analyzing the archives. Please try again or select a different publication.'
        }]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchInitialPitches();
  }, [filters.publication, filters.startDate, filters.endDate, hasFilterApplied]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading) return;
    
    // Add user message
    const userMessage: JordiMessage = { role: 'user', content: userInput };
    setMessages(prev => [...prev, userMessage]);
    
    // Clear input and set loading state
    setUserInput('');
    setIsLoading(true);
    
    try {
      // Call Jordi API with complete message history
      const response = await sendMessageToJordi(
        filters.publication,
        filters.startDate,
        filters.endDate,
        [...messages, userMessage]
      );
      
      // Add Jordi's response
      if (response.message) {
        setMessages(prev => [...prev, response.message]);
        
        // Store this conversation turn in history
        setConversationHistory(prev => [
          ...prev,
          {
            userMessage,
            assistantMessage: response.message,
            pitches: response.pitches || [],
            timestamp: new Date()
          }
        ]);
        
        // Select the latest conversation
        setSelectedConversation(null);
        
        // Update pitches if any were returned
        if (response.pitches && response.pitches.length > 0) {
          setCurrentPitches(response.pitches);
        }
      }
    } catch (error) {
      console.error('Error sending message to Jordi:', error);
      const errorMessage: JordiMessage = { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error processing your request. Please try again.' 
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
      // Add error to conversation history
      setConversationHistory(prev => [
        ...prev,
        {
          userMessage,
          assistantMessage: errorMessage,
          pitches: [],
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Event handler for suggested prompts
  const handleSuggestedPrompt = (prompt: string) => {
    setUserInput(prompt);
  };
  
  // Event handler for selecting a past conversation
  const handleSelectConversation = (index: number) => {
    setSelectedConversation(index);
    const conversation = conversationHistory[index];
    setCurrentPitches(conversation.pitches);
  };
  
  // Reset selection to show current conversation
  const handleShowCurrent = () => {
    setSelectedConversation(null);
  };
  
  // Function to highlight scandalous words in titles
  const highlightScandalousWords = (title: string): React.ReactNode => {
    const scandalousWords = [
      'scandal', 'secret', 'conspiracy', 'controversy', 'shocking', 
      'corruption', 'cover-up', 'affair', 'murder', 'mystery', 
      'crime', 'scandal', 'death', 'corruption', 'fraud', 'illegal',
      'sex', 'drugs', 'expose', 'hidden', 'scandal'
    ];
    
    // Don't highlight if it's a mock title that already has a prefix
    if (title.startsWith('[MOCK')) {
      return title;
    }
    
    // Use regex to find scandalous words, case insensitive
    const pattern = new RegExp(`(${scandalousWords.join('|')})`, 'gi');
    const parts = title.split(pattern);
    
    return parts.map((part, index) => {
      if (pattern.test(part)) {
        return (
          <span key={index} className="text-amber-400 relative animate-pulse-glow">
            {part}
          </span>
        );
      }
      return part;
    });
  };
  
  return (
    <div className="flex min-h-[calc(100vh-240px)] bg-transparent">
      {/* Left Side - Conversation */}
      <div className="w-2/5 border-r border-neutral-800 flex flex-col h-[calc(100vh-240px)]">
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {!hasFilterApplied && (
            <div className="flex justify-center items-center py-20 animate-fade-in">
              <div className="text-center max-w-md">
                <h3 className="text-xl font-medium text-white mb-3">Welcome to Human Story Atlas</h3>
                <p className="text-neutral-400">
                  Select a publication above to start exploring high-potential narratives with Jordi, your research assistant.
                </p>
              </div>
            </div>
          )}
          
          {hasFilterApplied && isLoading && messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping"></div>
                <Loader2 className="h-12 w-12 text-blue-500 animate-spin relative z-10 mb-4" />
              </div>
              <p className="text-neutral-300 mt-4">Analyzing {filters.publication} archives...</p>
              <p className="text-blue-400 text-sm mt-2 italic">Uncovering hidden narratives and provocative stories</p>
            </div>
          )}
          
          {/* Conversation History */}
          {conversationHistory.length > 0 && (
            <div className="mb-6 pb-4 border-b border-neutral-800 animate-slide-up">
              <h3 className="text-sm uppercase text-neutral-500 mb-3 tracking-wide font-medium">Conversation History</h3>
              <div className="space-y-2">
                {conversationHistory.map((conv, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSelectConversation(idx)}
                    className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                      selectedConversation === idx 
                        ? 'bg-blue-900/30 text-blue-300 border border-blue-800/60' 
                        : 'bg-neutral-800/50 hover:bg-neutral-800 text-neutral-300 border border-transparent hover:border-neutral-700'
                    }`}
                  >
                    <p className="truncate text-sm font-medium">{conv.userMessage.content}</p>
                    <div className="flex items-center justify-between text-xs mt-2">
                      <span className="text-neutral-500">{conv.timestamp.toLocaleTimeString()}</span>
                      <span className="px-2 py-0.5 bg-blue-900/30 rounded-full text-blue-300">
                        {conv.pitches.length} pitch{conv.pitches.length !== 1 ? 'es' : ''}
                      </span>
                    </div>
                  </div>
                ))}
                
                <div
                  onClick={handleShowCurrent}
                  className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                    selectedConversation === null 
                      ? 'bg-blue-900/30 text-blue-300 border border-blue-800/60' 
                      : 'bg-neutral-800/50 hover:bg-neutral-800 text-neutral-300 border border-transparent hover:border-neutral-700'
                  }`}
                >
                  <p className="truncate text-sm font-medium">Current conversation</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Initial welcome message */}
          {initialWelcomeMessage && (
            <div className="mb-6 animate-fade-in">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mr-3 flex items-center justify-center shadow-lg">
                  <span className="text-white font-medium">J</span>
                </div>
                <h3 className="font-semibold text-white">Jordi</h3>
              </div>
              <div className="text-white ml-11 bg-neutral-800/30 p-4 rounded-lg rounded-tl-none border-l border-blue-600/30">
                {initialWelcomeMessage.content}
              </div>
            </div>
          )}
          
          {/* Conversation Messages */}
          {hasFilterApplied && conversationHistory.map((conv, idx) => (
            <div 
              key={idx} 
              className={`${selectedConversation !== null && selectedConversation !== idx ? 'hidden' : 'animate-fade-in'}`}
            >
              <div className="pl-8 border-l-2 border-blue-500 mb-6">
                <div className="mb-2">
                  <span className="text-sm text-blue-400 font-medium">You asked</span>
                  <p className="text-white text-lg font-medium">{conv.userMessage.content}</p>
                </div>
              </div>
              
              <div className="mb-6 animate-slide-up">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mr-3 flex items-center justify-center shadow-lg">
                    <span className="text-white font-medium">J</span>
                  </div>
                  <h3 className="font-semibold text-white">Jordi</h3>
                </div>
                <div className="text-white ml-11 bg-neutral-800/30 p-4 rounded-lg rounded-tl-none border-l border-blue-600/30">
                  {conv.assistantMessage.content}
                </div>
              </div>
            </div>
          ))}
          
          {/* Current conversation messages that aren't in history yet */}
          {hasFilterApplied && selectedConversation === null && messages.length > 0 && messages[messages.length - 1].role === 'user' && (
            <div className="pl-8 border-l-2 border-blue-500 mb-6 animate-fade-in">
              <div className="mb-2">
                <span className="text-sm text-blue-400 font-medium">You asked</span>
                <p className="text-white text-lg font-medium">{messages[messages.length - 1].content}</p>
              </div>
            </div>
          )}
          
          {/* Loading indicator for new messages */}
          {isLoading && (
            <div className="flex items-center mb-6 animate-fade-in">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mr-3 flex items-center justify-center shadow-lg relative">
                <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping"></div>
                <Loader2 className="h-4 w-4 text-white animate-spin relative z-10" />
              </div>
              <div>
                <p className="text-neutral-400">Jordi is thinking...</p>
                <p className="text-xs text-neutral-500">Finding the most compelling narratives</p>
              </div>
            </div>
          )}
          
          <div ref={conversationEndRef} />
        </div>
        
        {/* Chat Input Area - Fixed at Bottom */}
        <div className="border-t border-neutral-800 py-4 px-4 bg-neutral-900/30 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="flex items-center gap-3">
            <input
              type="text"
              placeholder={hasFilterApplied ? "Ask Jordi about documentary or series ideas..." : "Select a publication to explore narratives"}
              className="flex-1 bg-neutral-800 text-white rounded-full px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 border border-neutral-700 text-sm shadow-inner transition-all"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              disabled={!hasFilterApplied || isLoading || externalIsLoading}
            />
            <button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-700 disabled:cursor-not-allowed text-white rounded-full p-3 shadow-md transition-all duration-200 hover:shadow-lg"
              disabled={!hasFilterApplied || !userInput.trim() || isLoading || externalIsLoading}
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </button>
          </form>
        </div>
      </div>
      
      {/* Right Side - Output Display */}
      <div className="w-3/5 h-[calc(100vh-240px)] overflow-y-auto p-6">
        {/* Selected conversation indicator */}
        {selectedConversation !== null && (
          <div 
            className="bg-blue-900/20 border border-blue-800 rounded-lg py-2 px-4 flex items-center text-sm text-blue-300 mb-6 shadow-sm animate-fade-in cursor-pointer"
            onClick={handleShowCurrent}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            <span>Viewing past results</span>
            <button className="ml-auto text-blue-400 hover:text-blue-300 font-medium">Back to current</button>
          </div>
        )}
        
        {/* Suggested prompts if no conversation yet */}
        {hasFilterApplied && conversationHistory.length === 0 && !isLoading && (
          <div className="mb-8 bg-neutral-800/40 p-5 rounded-lg border border-neutral-700 animate-slide-up shadow-md">
            <p className="text-neutral-200 mb-4 flex items-center font-medium">
              <span className="text-amber-400 mr-2">✨</span> 
              Try asking Jordi about provocative narratives:
            </p>
            <div className="flex flex-wrap gap-3">
              {suggestedPrompts.map((prompt, i) => (
                <div 
                  key={i}
                  onClick={() => handleSuggestedPrompt(prompt)}
                  className="text-blue-300 hover:text-blue-200 transition-colors cursor-pointer border border-blue-900/40 hover:border-blue-900/60 rounded-full px-4 py-2 text-sm bg-blue-900/20 hover:bg-blue-900/30 shadow-sm hover:shadow"
                >
                  {prompt}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Story Pitches */}
        <div className="space-y-8">
          {currentPitches.length === 0 && !isLoading && hasFilterApplied && (
            <div className="text-center py-10 animate-fade-in">
              <p className="text-neutral-400">No pitches to display yet.</p>
              <p className="text-neutral-500 text-sm mt-2">Ask Jordi to generate some documentary ideas.</p>
            </div>
          )}
          
          {currentPitches.map((pitch, pitchIndex) => (
            <div 
              key={pitch.id || pitchIndex} 
              className="bg-neutral-800/60 rounded-xl p-6 border-l-4 border-blue-500 hover:bg-neutral-800/80 transition-all duration-300 shadow-md card-hover animate-slide-up"
              style={{ animationDelay: `${pitchIndex * 0.1}s` }}
            >
              {pitch.id?.startsWith('mock') && (
                <div className="mb-3 px-3 py-1 bg-amber-800/30 border border-amber-700 rounded-md inline-block text-amber-400 text-xs font-medium">
                  Mock Data (Test Only)
                </div>
              )}
              <div className="flex items-start">
                <div className="bg-blue-900/30 p-2 rounded-lg shadow-sm mr-3">
                  <FilmIcon className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-white group-hover:text-blue-300 transition-colors">
                    {/* Highlight scandalous words in the title */}
                    {highlightScandalousWords(pitch.title)}
                  </h3>
                  <p className="text-blue-300 mt-1 italic">{pitch.tagline}</p>
                </div>
              </div>
              
              <div className="mt-5 space-y-4">
                {pitch.stories.map((story, idx) => (
                  <div key={idx} className="pl-4 border-l-2 border-blue-500/40 hover:border-blue-500 transition-colors py-1">
                    <h4 className="font-semibold text-white flex items-center">
                      <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                      {story.title}
                    </h4>
                    <p className="text-neutral-300 text-sm mt-1 ml-4">{story.snippet}</p>
                  </div>
                ))}
              </div>
              
              <div className="flex flex-wrap gap-4 mt-6 items-center">
                <span className="px-4 py-1.5 bg-blue-900/40 border border-blue-900/60 rounded-full text-blue-300 font-medium text-sm">
                  {pitch.potentialFormat}
                </span>
                {pitch.comparableTo && (
                  <span className="text-neutral-400 text-sm">
                    {pitch.comparableTo}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default JordiChat; 