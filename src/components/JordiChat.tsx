"use client";

/**
 * Jordi Chat Interface
 * 
 * NOTE: This component contains MOCK DATA that should be replaced with real data in production.
 * All mock data is clearly marked with [MOCK] or [MOCK DATA] prefixes.
 * These examples should NOT be considered real data - they are for development/testing only.
 */

import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader2, FilmIcon, ChevronLeft, UserCircle, Building2, MapPin } from 'lucide-react';
import { sendMessageToJordi, type JordiMessage, type StoryPitch, isWebSearchRequest, type WebSearchResult, type Entity } from '@/lib/jordi';

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
  entities?: Entity[];
  webSearchResults?: WebSearchResult[];
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
    "Find stories with strong character transformations",
    "What narratives connect to civil rights movements?",
    "Can you write a documentary treatment about environmental issues in the archive?",
    "Tell me more about community responses to local challenges",
    "Who are recurring figures across multiple stories?",
    "What story arcs show the evolution of this community?",
    "Find narratives about everyday heroes in the archive",
    "Analyze this story's potential for a documentary series",
    "Explore connections between political and social stories"
  ]);
  const [currentPitches, setCurrentPitches] = useState<StoryPitch[]>([]);
  const [conversationHistory, setConversationHistory] = useState<ConversationTurn[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [initialWelcomeMessage, setInitialWelcomeMessage] = useState<JordiMessage | null>(null);
  const [currentEntities, setCurrentEntities] = useState<Entity[]>([]);
  const [savedDocuments, setSavedDocuments] = useState<string[]>([]);
  
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
  
  // Add state to track when a treatment has been generated
  const [recentlyGeneratedTreatment, setRecentlyGeneratedTreatment] = useState<boolean>(false);
  // Add state to track if treatment is expanded
  const [expandedTreatment, setExpandedTreatment] = useState<boolean>(true);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading) return;
    
    // Check if this is a request for a documentary treatment
    const isTreatmentRequest = userInput.toLowerCase().includes('treatment') || 
                              userInput.toLowerCase().includes('documentary');
    
    // Add user message
    const userMessage: JordiMessage = { role: 'user', content: userInput };
    setMessages(prev => [...prev, userMessage]);
    
    // Clear input and set loading state
    setUserInput('');
    setIsLoading(true);
    
    // Reset treatment generated flag
    if (isTreatmentRequest) {
      setRecentlyGeneratedTreatment(false);
    }
    
    try {
      // Check if this is likely a web search request
      const shouldEnableWebSearch = isWebSearchRequest(userMessage.content);
      
      // Call Jordi API with complete message history
      const response = await sendMessageToJordi(
        filters.publication,
        filters.startDate,
        filters.endDate,
        [...messages, userMessage],
        shouldEnableWebSearch
      );
      
      // Add Jordi's response
      if (response.message) {
        setMessages(prev => [...prev, response.message]);
        
        // Check if the response is likely a documentary treatment
        const responseContent = response.message.content;
        const containsTreatment = responseContent.includes("WORKING TITLE") || 
                                 responseContent.includes("LOGLINE") || 
                                 responseContent.includes("SYNOPSIS") ||
                                 (responseContent.includes("ACT 1") && responseContent.includes("ACT 2"));
        
        // Set flag if we generated a treatment to show success notification
        if (isTreatmentRequest && containsTreatment) {
          setRecentlyGeneratedTreatment(true);
          
          // Scroll to treatment after a short delay to ensure it's rendered
          setTimeout(() => {
            document.getElementById('documentary-treatment')?.scrollIntoView({ 
              behavior: 'smooth',
              block: 'start'
            });
          }, 300);
        }
        
        // Store this conversation turn in history
        setConversationHistory(prev => [
          ...prev,
          {
            userMessage,
            assistantMessage: response.message,
            pitches: response.pitches || [],
            entities: response.entities || [],
            webSearchResults: response.webSearchResults,
            timestamp: new Date()
          }
        ]);
        
        // Select the latest conversation
        setSelectedConversation(null);
        
        // Update pitches if any were returned
        if (response.pitches && response.pitches.length > 0) {
          setCurrentPitches(response.pitches);
        }
        
        // Update entities if any were returned
        if (response.entities && response.entities.length > 0) {
          setCurrentEntities(response.entities);
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
    
    // Update pitches from the selected conversation
    setCurrentPitches(conversation.pitches);
    
    // Update entities from the selected conversation if available
    if (conversation.entities && conversation.entities.length > 0) {
      setCurrentEntities(conversation.entities);
    }
  };
  
  // Reset selection to show current conversation
  const handleShowCurrent = () => {
    setSelectedConversation(null);
    setUserInput('');
  };
  
  // Add a function to create a new query
  const handleNewQuery = () => {
    setUserInput('');
    
    // Auto-focus the input field
    const inputField = document.querySelector('input[type="text"]') as HTMLInputElement;
    if (inputField) {
      inputField.focus();
    }
    
    // Optionally scroll to input
    const inputArea = document.querySelector('.border-t.border-neutral-800');
    if (inputArea) {
      inputArea.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  // Function to highlight important keywords in titles for better readability
  const highlightImportantKeywords = (title: string): React.ReactNode => {
    // Don't highlight if it's a mock title that already has a prefix
    if (title.startsWith('[MOCK')) {
      return title;
    }
    
    // Instead of explicitly looking for "scandalous" words, highlight important narrative elements
    // These are words that indicate narrative tension, conflict, or significance
    const narrativeKeywords = [
      'investigation', 'discovery', 'revealed', 'uncovered', 'breakthrough', 
      'conflict', 'controversy', 'challenge', 'movement', 'transformation', 
      'justice', 'reform', 'impact', 'revolution', 'influence',
      'testimony', 'witness', 'report', 'exclusive', 'untold'
    ];
    
    // Use regex to find important narrative words, case insensitive
    const pattern = new RegExp(`(${narrativeKeywords.join('|')})`, 'gi');
    const parts = title.split(pattern);
    
    return parts.map((part, index) => {
      if (pattern.test(part)) {
        return (
          <span key={index} className="text-blue-400 font-medium">
            {part}
          </span>
        );
      }
      return part;
    });
  };
  
  // Add a new component for displaying web search results
  const WebSearchResultsDisplay = ({ results }: { results: WebSearchResult[] }) => {
    if (!results || results.length === 0) return null;
    
    return (
      <div className="mt-4 border border-blue-800 rounded-lg p-4 bg-blue-900/20">
        <h3 className="text-blue-300 font-medium mb-2">Supplemental Context</h3>
        <p className="text-neutral-400 text-xs mb-3">Additional information related to archive content</p>
        <div className="space-y-3">
          {results.map((result, idx) => (
            <div key={idx} className="border-b border-blue-800/50 pb-2 last:border-0">
              <h4 className="text-white font-medium">{result.title}</h4>
              <p className="text-neutral-300 text-sm">{result.snippet}</p>
              <a 
                href={result.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-400 text-xs hover:underline"
              >
                {result.url}
              </a>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  // Add a new component for quick action buttons after responses
  const ResponseActions = ({ 
    onNewQuery, 
    onSaveDocument, 
    documentType = "response" 
  }: { 
    onNewQuery: () => void, 
    onSaveDocument: () => void,
    documentType?: string 
  }) => {
    return (
      <div className="flex flex-wrap gap-3 mt-4">
        <button 
          onClick={onNewQuery}
          className="text-sm px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center"
        >
          <span className="mr-2">+</span> New Query
        </button>
        <button 
          onClick={onSaveDocument}
          className="text-sm px-4 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-md flex items-center"
        >
          <span className="mr-2">💾</span> Save {documentType}
        </button>
      </div>
    );
  };
  
  // Add a new component to display entities (recurring figures)
  const EntityDisplay = ({ entities }: { entities: Entity[] }) => {
    if (!entities || entities.length === 0) return null;
    
    // Get icon for entity type
    const getEntityIcon = (type: string) => {
      switch(type) {
        case 'person':
          return <UserCircle className="h-4 w-4 text-blue-300" />;
        case 'organization':
          return <Building2 className="h-4 w-4 text-green-300" />;
        case 'place':
          return <MapPin className="h-4 w-4 text-yellow-300" />;
        default:
          return null;
      }
    };
    
    return (
      <div className="mt-6 border border-blue-800 rounded-lg overflow-hidden shadow-lg animate-fade-in">
        <div className="bg-blue-900/40 py-3 px-4 flex items-center justify-between">
          <span className="text-blue-300 font-medium">Recurring Figures</span>
        </div>
        <div className="p-4 bg-neutral-800/40 space-y-4">
          {entities.map((entity, index) => (
            <div key={index} className="border-b border-neutral-700 pb-4 last:border-0 last:pb-0">
              <div className="flex items-center gap-2 mb-2">
                {getEntityIcon(entity.type)}
                <h4 className="text-white font-medium">{entity.name}</h4>
                <span className="text-xs text-neutral-400 ml-auto">
                  Appears in {entity.count} stories
                </span>
              </div>
              
              {entity.stories && entity.stories.length > 0 && (
                <div className="ml-6 mt-2 space-y-2">
                  <p className="text-xs text-neutral-400 uppercase tracking-wide">Associated Stories</p>
                  {entity.stories.map((story, idx) => (
                    <div key={idx} className="p-2 bg-neutral-800/60 rounded-md hover:bg-neutral-800 cursor-pointer">
                      <p className="text-sm text-white">{story.title}</p>
                      <p className="text-xs text-neutral-500">{story.date}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  // Add handleSaveDocument function back
  const handleSaveDocument = (content: string, fileName: string = "documentary-treatment") => {
    // Create a blob with the content
    const blob = new Blob([content], { type: 'text/plain' });
    
    // Create a URL for the blob
    const url = URL.createObjectURL(blob);
    
    // Create a link element
    const link = document.createElement('a');
    
    // Set link properties
    const fullFileName = `${fileName}-${new Date().toISOString().slice(0, 10)}.txt`;
    link.href = url;
    link.download = fullFileName;
    
    // Append the link to the body
    document.body.appendChild(link);
    
    // Click the link to trigger download
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Track the saved document
    setSavedDocuments(prev => [...prev, fullFileName]);
    
    // Show a notification
    alert(`Document saved as ${fullFileName}`);
  };
  
  // Add a new component to display documentary treatments in a structured format
  const DocumentaryTreatment = ({ content }: { content: string }) => {
    const [isExpanded, setIsExpanded] = useState<boolean>(true);
    
    if (!content) return null;
    
    // Simplified treatment detection logic
    const hasWorkingTitle = content.includes("WORKING TITLE");
    const hasLogline = content.includes("LOGLINE");
    const hasSynopsis = content.includes("SYNOPSIS");
    const hasMainCharacters = content.includes("MAIN CHARACTERS");
    const hasStoryStructure = content.includes("STORY STRUCTURE");
    const hasVisualApproach = content.includes("VISUAL APPROACH");
    const hasComparableWorks = content.includes("COMPARABLE WORKS");
    const hasSignificance = content.includes("SIGNIFICANCE");
    
    // Count how many sections we have
    const sectionCount = [
      hasWorkingTitle, hasLogline, hasSynopsis, hasMainCharacters,
      hasStoryStructure, hasVisualApproach, hasComparableWorks, hasSignificance
    ].filter(Boolean).length;
    
    // Consider it a valid treatment if it has at least 4 of the required sections
    const isValidTreatment = sectionCount >= 4;
    
    console.log("Treatment detection:", { 
      sectionCount,
      isValidTreatment,
      sections: {
        hasWorkingTitle, hasLogline, hasSynopsis, hasMainCharacters,
        hasStoryStructure, hasVisualApproach, hasComparableWorks, hasSignificance
      }
    });
    
    // Extract sections using simple patterns
    const extractedSections: Record<string, string> = {};
    
    if (hasWorkingTitle) {
      const match = content.match(/WORKING TITLE:?\s*([^\n]+)/i);
      if (match && match[1]) extractedSections["WORKING TITLE"] = match[1].trim();
    }
    
    if (hasLogline) {
      const match = content.match(/LOGLINE:?\s*([^\n]+)/i);
      if (match && match[1]) extractedSections["LOGLINE"] = match[1].trim();
    }
    
    if (hasSynopsis) {
      const match = content.match(/SYNOPSIS:?\s*([\s\S]+?)(?=MAIN CHARACTERS|STORY STRUCTURE|VISUAL APPROACH|COMPARABLE WORKS|SIGNIFICANCE|$)/i);
      if (match && match[1]) extractedSections["SYNOPSIS"] = match[1].trim();
    }
    
    if (hasMainCharacters) {
      const match = content.match(/MAIN CHARACTERS:?\s*([\s\S]+?)(?=STORY STRUCTURE|VISUAL APPROACH|COMPARABLE WORKS|SIGNIFICANCE|$)/i);
      if (match && match[1]) extractedSections["MAIN CHARACTERS"] = match[1].trim();
    }
    
    if (hasStoryStructure) {
      const match = content.match(/STORY STRUCTURE:?\s*([\s\S]+?)(?=VISUAL APPROACH|COMPARABLE WORKS|SIGNIFICANCE|$)/i);
      if (match && match[1]) extractedSections["STORY STRUCTURE"] = match[1].trim();
    }
    
    if (hasVisualApproach) {
      const match = content.match(/VISUAL APPROACH:?\s*([\s\S]+?)(?=COMPARABLE WORKS|SIGNIFICANCE|$)/i);
      if (match && match[1]) extractedSections["VISUAL APPROACH"] = match[1].trim();
    }
    
    if (hasComparableWorks) {
      const match = content.match(/COMPARABLE WORKS:?\s*([\s\S]+?)(?=SIGNIFICANCE|$)/i);
      if (match && match[1]) extractedSections["COMPARABLE WORKS"] = match[1].trim();
    }
    
    if (hasSignificance) {
      const match = content.match(/SIGNIFICANCE:?\s*([\s\S]+)/i);
      if (match && match[1]) extractedSections["SIGNIFICANCE"] = match[1].trim();
    }
    
    // If it's a valid treatment with enough sections, show the nicely formatted version
    if (isValidTreatment && Object.keys(extractedSections).length >= 4) {
      return (
        <div id="documentary-treatment" className={`mt-6 border border-blue-800 rounded-lg overflow-hidden shadow-lg animate-fade-in ${recentlyGeneratedTreatment ? 'ring-4 ring-blue-500 relative' : ''}`}>
          {recentlyGeneratedTreatment && (
            <div className="absolute top-0 right-0 bg-blue-600 text-white px-3 py-1 rounded-bl-lg text-sm font-medium z-10">
              Treatment Generated ✓
            </div>
          )}
          <div className="bg-blue-900/40 py-3 px-4 flex items-center justify-between cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
            <span className="text-blue-300 font-medium">Documentary Treatment</span>
            <span className="text-blue-300">
              {isExpanded ? '▼' : '►'}
            </span>
          </div>
          
          {isExpanded && (
            <div className="divide-y divide-blue-800/30">
              {extractedSections["WORKING TITLE"] && (
                <div className="p-4 bg-blue-900/20">
                  <h3 className="text-white text-xl font-bold">{extractedSections["WORKING TITLE"]}</h3>
                  {extractedSections["LOGLINE"] && (
                    <p className="text-blue-300 mt-2 italic">{extractedSections["LOGLINE"]}</p>
                  )}
                </div>
              )}
              
              {extractedSections["SYNOPSIS"] && (
                <div className="p-4 bg-neutral-800/30">
                  <h4 className="text-blue-300 font-medium mb-2">SYNOPSIS</h4>
                  <p className="text-white whitespace-pre-wrap">{extractedSections["SYNOPSIS"]}</p>
                </div>
              )}
              
              {extractedSections["MAIN CHARACTERS"] && (
                <div className="p-4 bg-neutral-800/40">
                  <h4 className="text-blue-300 font-medium mb-2">MAIN CHARACTERS/SUBJECTS</h4>
                  <p className="text-white whitespace-pre-wrap">{extractedSections["MAIN CHARACTERS"]}</p>
                </div>
              )}
              
              {extractedSections["STORY STRUCTURE"] && (
                <div className="p-4 bg-neutral-800/30">
                  <h4 className="text-blue-300 font-medium mb-2">STORY STRUCTURE</h4>
                  <p className="text-white whitespace-pre-wrap">{extractedSections["STORY STRUCTURE"]}</p>
                </div>
              )}
              
              {extractedSections["VISUAL APPROACH"] && (
                <div className="p-4 bg-neutral-800/40">
                  <h4 className="text-blue-300 font-medium mb-2">VISUAL APPROACH</h4>
                  <p className="text-white whitespace-pre-wrap">{extractedSections["VISUAL APPROACH"]}</p>
                </div>
              )}
              
              {extractedSections["COMPARABLE WORKS"] && (
                <div className="p-4 bg-neutral-800/30">
                  <h4 className="text-blue-300 font-medium mb-2">COMPARABLE WORKS</h4>
                  <p className="text-white whitespace-pre-wrap">{extractedSections["COMPARABLE WORKS"]}</p>
                </div>
              )}
              
              {extractedSections["SIGNIFICANCE"] && (
                <div className="p-4 bg-neutral-800/40">
                  <h4 className="text-blue-300 font-medium mb-2">SIGNIFICANCE</h4>
                  <p className="text-white whitespace-pre-wrap">{extractedSections["SIGNIFICANCE"]}</p>
                </div>
              )}
            </div>
          )}
        </div>
      );
    }
    
    // Otherwise, show the generator panel
    // Look for a potential title in the content
    let potentialTitle = "";
    const titleMatch = content.match(/(?:title:?\s*|documentary about\s*)["']?([^"'\n]+)["']?/i) || 
                       content.match(/(?:threads featuring\s*)["']?([^"'\n.]+)["']?/i);
    if (titleMatch && titleMatch[1]) {
      potentialTitle = titleMatch[1].trim();
    } else if (content.includes("character transformations")) {
      potentialTitle = "character transformations";
    }
    
    return (
      <div id="documentary-treatment" className="mt-6 border border-blue-800 rounded-lg overflow-hidden bg-blue-900/20">
        <div className="bg-blue-900/40 py-3 px-4 flex items-center">
          <span className="text-white font-medium">Documentary Treatment Generator</span>
        </div>
        <div className="p-4 whitespace-pre-wrap text-white">
          <p className="text-blue-300 mb-4">Create a documentary treatment by clicking the button below:</p>
          <button 
            onClick={() => {
              setUserInput(`Create a documentary treatment with the following structure:

WORKING TITLE: The Evolution of ${potentialTitle || "This Community"} 

LOGLINE: [A compelling one-sentence summary of the documentary]

SYNOPSIS:
[A paragraph describing the overall documentary narrative]

MAIN CHARACTERS:
[Description of key individuals/subjects in the documentary]

STORY STRUCTURE:
[Details about the three-act structure of the documentary]

VISUAL APPROACH:
[Description of the visual style and techniques]

COMPARABLE WORKS:
[Similar successful documentaries]

SIGNIFICANCE:
[Why this story matters and why audiences would care]`);
              setTimeout(() => {
                const inputForm = document.querySelector('form');
                if (inputForm) inputForm.dispatchEvent(new Event('submit', { cancelable: true }));
              }, 100);
            }}
            className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md border border-blue-700 shadow-sm mb-4"
          >
            Generate Documentary Treatment
          </button>
          
          <div className="mt-4 text-sm">
            <p className="text-blue-300 mt-4 mb-2">Required treatment sections:</p>
            <div className="bg-neutral-800/60 p-3 rounded text-sm">
              WORKING TITLE<br/>
              LOGLINE<br/>
              SYNOPSIS<br/>
              MAIN CHARACTERS<br/>
              STORY STRUCTURE<br/>
              VISUAL APPROACH<br/>
              COMPARABLE WORKS<br/>
              SIGNIFICANCE
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Add a function to scroll to the treatment
  const scrollToTreatment = () => {
    document.getElementById('documentary-treatment')?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };
  
  // Function to check if a message is asking for a documentary treatment
  const isAskingForTreatment = (message: string): boolean => {
    const treatmentTerms = [
      'treatment', 
      'documentary', 
      'create a doc',
      'make a documentary'
    ];
    
    const lowerMessage = message.toLowerCase();
    return treatmentTerms.some(term => lowerMessage.includes(term));
  };
  
  // Function to check if a message is asking about recurring figures
  const isAskingAboutRecurringFigures = (message: string): boolean => {
    const figureTerms = [
      'recurring figures', 
      'key figures', 
      'important people', 
      'who appears', 
      'who shows up', 
      'main characters',
      'notable individuals',
      'prominent figures'
    ];
    
    const lowerMessage = message.toLowerCase();
    return figureTerms.some(term => lowerMessage.includes(term));
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
                  Select a publication above to start exploring narrative threads in the archives with Jordi, your narrative research assistant.
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
              <p className="text-blue-400 text-sm mt-2 italic">Uncovering meaningful narrative threads and connections</p>
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
          
          {/* Current conversation messages */}
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
                
                {/* Always show action buttons for every response */}
                <div className="ml-11 mt-3 bg-neutral-800/70 rounded-lg p-3 border border-neutral-700 animate-fade-in">
                  <div className="flex flex-wrap gap-2">
                    <button 
                      onClick={() => setUserInput('Tell me more about this')}
                      className="text-xs px-3 py-1.5 bg-blue-900/50 hover:bg-blue-900/70 text-blue-300 rounded-full border border-blue-800"
                    >
                      Tell me more about this
                    </button>
                    {isAskingForTreatment(conv.userMessage.content) && recentlyGeneratedTreatment ? (
                      <button 
                        onClick={scrollToTreatment}
                        className="text-xs px-3 py-1.5 bg-green-900/50 hover:bg-green-900/70 text-green-300 rounded-full border border-green-800"
                      >
                        View Treatment
                      </button>
                    ) : (
                      <button 
                        onClick={() => setUserInput('Create a documentary treatment about this')}
                        className="text-xs px-3 py-1.5 bg-blue-900/50 hover:bg-blue-900/70 text-blue-300 rounded-full border border-blue-800"
                      >
                        Create treatment
                      </button>
                    )}
                    {isAskingAboutRecurringFigures(conv.userMessage.content) ? (
                      <>
                        <button 
                          onClick={() => setUserInput('Tell me more about the most influential figure in the archives')}
                          className="text-xs px-3 py-1.5 bg-blue-900/50 hover:bg-blue-900/70 text-blue-300 rounded-full border border-blue-800"
                        >
                          Focus on influential figure
                        </button>
                        <button 
                          onClick={() => setUserInput('What stories connect these different figures?')}
                          className="text-xs px-3 py-1.5 bg-blue-900/50 hover:bg-blue-900/70 text-blue-300 rounded-full border border-blue-800"
                        >
                          Find connections
                        </button>
                      </>
                    ) : (
                      <button 
                        onClick={() => setUserInput('Who are other key figures related to this?')}
                        className="text-xs px-3 py-1.5 bg-blue-900/50 hover:bg-blue-900/70 text-blue-300 rounded-full border border-blue-800"
                      >
                        Find related figures
                      </button>
                    )}
                    <button 
                      onClick={() => handleSaveDocument(conv.assistantMessage.content, "jordi-response")}
                      className="text-xs px-3 py-1.5 bg-neutral-700 hover:bg-neutral-600 text-neutral-300 rounded-full border border-neutral-600"
                    >
                      Save response
                    </button>
                  </div>
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
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder={hasFilterApplied ? "Ask Jordi about stories, narratives, and documentary ideas from the archive..." : "Select a publication to explore archives"}
                className="w-full bg-neutral-800 text-white rounded-full px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 border border-neutral-700 text-sm shadow-inner transition-all pr-10"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                disabled={!hasFilterApplied || isLoading || externalIsLoading}
              />
              {userInput && (
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-white"
                  onClick={() => setUserInput('')}
                >
                  ✕
                </button>
              )}
            </div>
            <button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-neutral-700 disabled:cursor-not-allowed text-white rounded-full p-3 shadow-md transition-all duration-200 hover:shadow-lg"
              disabled={!hasFilterApplied || !userInput.trim() || isLoading || externalIsLoading}
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            </button>
          </form>
          
          {savedDocuments.length > 0 && (
            <div className="mt-3 text-xs">
              <p className="text-neutral-500">Recent saves: {savedDocuments.slice(-3).join(', ')}</p>
            </div>
          )}
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
        
        {/* Quick path buttons - always show at top of right panel */}
        {hasFilterApplied && !isLoading && (
          <div className="mb-6 bg-neutral-800/40 rounded-lg p-4 border border-neutral-700 shadow-md">
            <p className="text-neutral-200 mb-3 text-sm font-medium">
              Quick paths:
            </p>
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => setUserInput('Create a documentary treatment about the most compelling story in the archive')}
                className="text-xs px-3 py-2 bg-blue-800 hover:bg-blue-700 text-white rounded-md border border-blue-700 shadow-sm"
              >
                Generate Documentary Treatment
              </button>
              <button 
                onClick={() => setUserInput('Who are the most interesting recurring figures in the archive?')}
                className="text-xs px-3 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-md border border-neutral-600 shadow-sm"
              >
                Find Key Figures
              </button>
              <button 
                onClick={() => setUserInput('Suggest 3 compelling story arcs from the archive')}
                className="text-xs px-3 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-md border border-neutral-600 shadow-sm"
              >
                Discover Story Arcs
              </button>
            </div>
          </div>
        )}
        
        {/* Suggested prompts if no conversation yet */}
        {hasFilterApplied && conversationHistory.length === 0 && !isLoading && (
          <div className="mb-8 bg-neutral-800/40 p-5 rounded-lg border border-neutral-700 animate-slide-up shadow-md">
            <p className="text-neutral-200 mb-4 flex items-center font-medium">
              <span className="text-amber-400 mr-2">✨</span> 
              Try asking Jordi about narrative possibilities in the archive:
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
        
        {/* Current entities (if not showing a previous conversation) */}
        {selectedConversation === null && currentEntities.length > 0 && (
          <EntityDisplay entities={currentEntities} />
        )}
        
        {/* Entities from selected past conversation */}
        {selectedConversation !== null && 
          conversationHistory[selectedConversation]?.entities && 
          conversationHistory[selectedConversation].entities?.length > 0 && (
            <EntityDisplay entities={conversationHistory[selectedConversation].entities!} />
        )}
        
        {/* Web search results for current conversation */}
        {selectedConversation === null && 
          conversationHistory.length > 0 && 
          conversationHistory[conversationHistory.length - 1].webSearchResults && (
            <WebSearchResultsDisplay results={conversationHistory[conversationHistory.length - 1].webSearchResults!} />
        )}
        
        {/* Web search results for selected conversation */}
        {selectedConversation !== null && 
          conversationHistory[selectedConversation].webSearchResults && (
            <WebSearchResultsDisplay results={conversationHistory[selectedConversation].webSearchResults!} />
        )}
        
        {/* Documentary Treatment for current conversation */}
        {selectedConversation === null && 
          conversationHistory.length > 0 && (
            <>
              {recentlyGeneratedTreatment && (
                <div className="mb-4 bg-blue-900/20 border-l-4 border-blue-500 p-3 rounded-r-lg animate-pulse-once">
                  <p className="text-blue-300">
                    <span className="font-bold">✓</span> Documentary treatment generated successfully! Scroll down to view.
                  </p>
                </div>
              )}
              <div className="mb-4 bg-neutral-800/40 rounded-lg p-4 border border-neutral-700 shadow-md">
                <p className="text-neutral-200 mb-3 text-sm font-medium">
                  Document Tools:
                </p>
                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={() => {
                      setRecentlyGeneratedTreatment(true);
                      setTimeout(() => {
                        document.getElementById('documentary-treatment')?.scrollIntoView({ 
                          behavior: 'smooth',
                          block: 'start'
                        });
                      }, 100);
                    }}
                    className="text-xs px-3 py-2 bg-blue-800 hover:bg-blue-700 text-white rounded-md border border-blue-700 shadow-sm"
                  >
                    View Generated Treatment
                  </button>
                  <button 
                    onClick={() => handleSaveDocument(conversationHistory[conversationHistory.length - 1].assistantMessage.content, "documentary-treatment")}
                    className="text-xs px-3 py-2 bg-neutral-700 hover:bg-neutral-600 text-white rounded-md border border-neutral-600 shadow-sm"
                  >
                    Save as Text Document
                  </button>
                </div>
              </div>
              <DocumentaryTreatment content={conversationHistory[conversationHistory.length - 1].assistantMessage.content} />
            </>
        )}
        
        {/* Documentary Treatment for selected conversation */}
        {selectedConversation !== null && (
          <DocumentaryTreatment content={conversationHistory[selectedConversation].assistantMessage.content} />
        )}
        
        {/* Current pitches (if not showing a previous conversation) */}
        {selectedConversation === null && currentPitches.length > 0 && (
          <div className="mt-8 space-y-6">
            <h3 className="text-lg font-medium text-white border-b border-neutral-700 pb-2 mb-4">Story Pitches</h3>
            {currentPitches.map((pitch, idx) => (
              <div 
                key={idx}
                className="bg-neutral-800/60 rounded-xl p-6 border-l-4 border-blue-500 hover:bg-neutral-800/80 transition-all duration-300 shadow-md card-hover animate-slide-up"
                style={{ animationDelay: `${idx * 0.1}s` }}
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
                      {/* Highlight important keywords in the title */}
                      {highlightImportantKeywords(pitch.title)}
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
                
                {/* Add buttons to ask for treatment about this pitch */}
                <div className="mt-4 flex gap-2">
                  <button 
                    onClick={() => setUserInput(`Create a documentary treatment about "${pitch.title}"`)}
                    className="text-xs px-3 py-1.5 bg-blue-900/50 hover:bg-blue-900/70 text-blue-300 rounded-full border border-blue-800"
                  >
                    Create treatment for this
                  </button>
                  <button 
                    onClick={() => setUserInput(`Tell me more about "${pitch.title}"`)}
                    className="text-xs px-3 py-1.5 bg-blue-900/50 hover:bg-blue-900/70 text-blue-300 rounded-full border border-blue-800"
                  >
                    More details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Pitches in selected conversation */}
        {selectedConversation !== null && conversationHistory[selectedConversation].pitches.length > 0 && (
          <div className="mt-8 space-y-6">
            <h3 className="text-lg font-medium text-white border-b border-neutral-700 pb-2 mb-4">Story Pitches</h3>
            {conversationHistory[selectedConversation].pitches.map((pitch, idx) => (
              <div 
                key={idx}
                className="bg-neutral-800/60 rounded-xl p-6 border-l-4 border-blue-500 hover:bg-neutral-800/80 transition-all duration-300 shadow-md card-hover animate-slide-up"
                style={{ animationDelay: `${idx * 0.1}s` }}
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
                      {/* Highlight important keywords in the title */}
                      {highlightImportantKeywords(pitch.title)}
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
                
                {/* Add buttons to ask for treatment about this pitch */}
                <div className="mt-4 flex gap-2">
                  <button 
                    onClick={() => setUserInput(`Create a documentary treatment about "${pitch.title}"`)}
                    className="text-xs px-3 py-1.5 bg-blue-900/50 hover:bg-blue-900/70 text-blue-300 rounded-full border border-blue-800"
                  >
                    Create treatment for this
                  </button>
                  <button 
                    onClick={() => setUserInput(`Tell me more about "${pitch.title}"`)}
                    className="text-xs px-3 py-1.5 bg-blue-900/50 hover:bg-blue-900/70 text-blue-300 rounded-full border border-blue-800"
                  >
                    More details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Response Actions */}
        {selectedConversation !== null && (
          <ResponseActions 
            onNewQuery={handleNewQuery}
            onSaveDocument={() => handleSaveDocument(conversationHistory[selectedConversation].assistantMessage.content)}
          />
        )}
        
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default JordiChat; 