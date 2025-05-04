import React from 'react';
import { MessageCircle, BookOpen, TrendingUp, FileText, User } from 'lucide-react';

interface Story {
  id: string;
  title: string;
  publication: string;
  date: string;
  snippet: string;
  relevanceScore: number;
}

interface Arc {
  id: string;
  title: string;
  storyCount: number;
  timespan: string;
  summary: string;
  themes?: string[];
}

interface NLQueryResponseProps {
  query: string;
  stories: Story[];
  arcs: Arc[];
  isLoading: boolean;
}

const NLQueryResponse: React.FC<NLQueryResponseProps> = ({ query, stories, arcs, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-neutral-800/30 p-5 rounded-lg shadow-sm border border-neutral-700">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center">
            <MessageCircle className="h-4 w-4 text-blue-400" />
          </div>
          <div className="h-4 w-32 bg-neutral-700 rounded animate-pulse"></div>
        </div>
        <div className="pl-11">
          <div className="h-4 w-full bg-neutral-700 rounded animate-pulse mb-2"></div>
          <div className="h-4 w-3/4 bg-neutral-700 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }
  
  if (!query || stories.length === 0) {
    return null;
  }
  
  // Define lowercaseQuery outside the generateJordiResponse function for broader access
  const lowercaseQuery = query.toLowerCase();
  
  // Generate a Jordi-styled narrative response based on the query and results
  const generateJordiResponse = () => {
    let response = "";
    let sideNote = "";
    let showTreatment = null;
    
    // Check if query is asking for a show treatment or pitch
    if (lowercaseQuery.includes('netflix') || lowercaseQuery.includes('treatment') || lowercaseQuery.includes('pitch') || lowercaseQuery.includes('show idea') || lowercaseQuery.includes('series')) {
      let subject = ""; 
      
      if (lowercaseQuery.includes('oil') || lowercaseQuery.includes('energy')) {
        subject = "the energy crisis";
        showTreatment = {
          title: "Power Play",
          tagline: "When the lights go out, the real monsters emerge.",
          pitch: "Set against the backdrop of the 1979 energy crisis, this limited series follows a small-town mayor forced to negotiate with shadowy OPEC intermediaries while managing growing unrest at home. As gas lines stretch for miles and violence erupts at local stations, buried town secrets begin to surface, revealing a decades-old conspiracy that connects City Hall to international oil cartels."
        };
      } else if (lowercaseQuery.includes('watergate') || lowercaseQuery.includes('nixon') || lowercaseQuery.includes('politics')) {
        subject = "the Watergate scandal";
        showTreatment = {
          title: "The Machinery",
          tagline: "The headlines told you who fell. This is about who pushed.",
          pitch: "While Nixon and his inner circle dominated the headlines, this series focuses on the mid-level staffers who became reluctant whistleblowers. Through the eyes of three previously unknown government employees, we witness the moral compromises, personal threats, and quiet acts of courage that ultimately brought down an administration."
        };
      } else if (lowercaseQuery.includes('sports') || lowercaseQuery.includes('coach') || lowercaseQuery.includes('scandal')) {
        subject = "the coaching scandal";
        showTreatment = {
          title: "Hometown Hero",
          tagline: "They needed a victory. He needed worship.",
          pitch: "When a beloved high school basketball coach leads his team to state championships through questionable methods, a small Ohio town divides between those demanding accountability and others protecting their hero at all costs. Based on the 1977 Toledo recruitment violations case, this series examines how communities build myths—and what they'll sacrifice to maintain them."
        };
      } else if (lowercaseQuery.includes('women') || lowercaseQuery.includes('equality') || lowercaseQuery.includes('rights')) {
        subject = "women's equality movement";
        showTreatment = {
          title: "The Second Wave",
          tagline: "They wanted equality. They got a revolution.",
          pitch: "Following three women from vastly different backgrounds who become unlikely allies in the 1970s women's equality movement. From corporate boardrooms to factory floors to suburban kitchens, this series chronicles how personal frustration transforms into political action against overwhelming institutional resistance."
        };
      } else if (lowercaseQuery.includes('whistleblower') || lowercaseQuery.includes('medical') || lowercaseQuery.includes('doctor')) {
        subject = "medical whistleblowers";
        showTreatment = {
          title: "Side Effects",
          tagline: "In a hospital built on silence, truth is terminal.",
          pitch: "When a dedicated young doctor discovers a pattern of suspicious deaths at her prestigious hospital, her investigation uncovers a web of pharmaceutical kickbacks, falsified records, and administrative cover-ups. Based on scattered reports from 1970s medical journals, this tense medical thriller examines how institutions meant to heal can sometimes cause the deepest harm."
        };
      } else {
        subject = "this subject";
        showTreatment = {
          title: "The Archive",
          tagline: "History forgot these stories. They won't forget you.",
          pitch: "A compelling narrative based on forgotten news stories from the archive. This series would weave together seemingly unrelated events into a cohesive story that reveals hidden connections between people, places, and powerful institutions."
        };
      }
      
      response = `Based on the narrative fragments I've discovered about ${subject}, here's a potential streaming series concept:`;
      sideNote = "This treatment combines elements from multiple stories while maintaining the emotional and thematic truth of the historical events.";
    }
    // Oil crisis / Energy narratives
    else if (lowercaseQuery.includes('oil') || lowercaseQuery.includes('energy') || lowercaseQuery.includes('crisis')) {
      response = "I've uncovered what feels like an HBO miniseries about American anxiety during the oil crisis. There's a powerful narrative arc forming around everyday people caught in geopolitical crossfire — gas lines become theaters of conflict where ordinary citizens reveal extraordinary character dimensions.";
      sideNote = "The Toledo Blade coverage gives a uniquely midwestern perspective on the crisis. Their local reporters captured neighborhood tensions missing from national coverage. The gap between OPEC's announcement and the public response creates perfect dramatic tension.";
    } 
    // True crime narratives
    else if (lowercaseQuery.includes('crime') || lowercaseQuery.includes('murder') || lowercaseQuery.includes('mystery')) {
      response = "There's rich true crime potential in these overlooked stories. I'm seeing three distinct narrative shapes emerging: a political cover-up with mysterious witnesses who vanished from public record; a series of seemingly unrelated financial crimes with a hidden pattern; and what appears to be a 'perfect crime' that unraveled through a completely unexpected documentation error.";
      sideNote = "Local papers often preserved details about these cases that national coverage missed entirely. The Toledo archives in particular contain witness statements that contradict the 'official' narrative that eventually emerged.";
    }
    // Watergate / Political scandal narratives
    else if (lowercaseQuery.includes('watergate') || lowercaseQuery.includes('nixon') || lowercaseQuery.includes('scandal')) {
      response = "There's a 'bureaucratic thriller' thread emerging here — not just about Nixon, but the web of characters caught in the machinery of power. This reads like a multi-perspective narrative where even minor players had crucial roles in the collapse of an administration. The stories reveal fascinating psychological portraits of loyalty and betrayal.";
      sideNote = "Notice how the local reporting angles differ from the national coverage? The regional papers found human stories that the Washington coverage missed entirely. There's also a fascinating thread about how everyday citizens reacted to each revelation.";
    } 
    // Space / Apollo narratives
    else if (lowercaseQuery.includes('apollo') || lowercaseQuery.includes('moon') || lowercaseQuery.includes('space')) {
      response = "Beyond the flag-planting heroism, I'm seeing a 'hidden figures' narrative about the ground teams and technical staff. There's a powerful story about the invisible architecture of achievement woven throughout these fragments. Several key personnel — including women and minorities — appear briefly in local coverage but were edited out of the official narrative.";
      sideNote = "The technical documentation preserved alongside the news coverage creates a fascinating dialogue between public perception and engineering reality. Several 'near disasters' during the missions received almost no press coverage.";
    }
    // Sports narratives 
    else if (lowercaseQuery.includes('sports') || lowercaseQuery.includes('athlete') || lowercaseQuery.includes('olympic')) {
      response = "I'm detecting an underdog arc with echoes of mainstream sports films, but with a complicated twist — there are ethical gray areas and institutional pressures that would make this more than a simple triumph narrative. The coach at the center becomes both hero and villain depending on whose perspective you follow.";
      sideNote = "The Toledo Blade's coverage of the 1977 basketball recruitment scandal offers a unique window into how a community processes betrayal by a beloved figure. There are fascinating character studies in the divided reactions of parents, students, and local officials.";
    }
    // Women's movement narratives
    else if (lowercaseQuery.includes('women') || lowercaseQuery.includes('equality') || lowercaseQuery.includes('feminist')) {
      response = "There's a powerful collective narrative forming around the women's equality movement that transcends individual stories. What begins as isolated workplace incidents gradually coalesces into organized resistance. The shifting perspective from individual to collective action would make for compelling storytelling.";
      sideNote = "Local papers captured intimate portraits of the women involved that national media missed. Several key organizers appear in early coverage before disappearing from the public record — their personal stories would make for fascinating character studies.";
    }
    // Default response with creative narrative framing
    else {
      response = `I've found something intriguing about ${query}. There's a narrative pattern emerging that feels part investigative journey, part human drama. The story fragments suggest unexpected connections across time periods and personalities that could form the backbone of a compelling documentary or series.`;
      sideNote = "Some of these threads were nearly lost to history — they appear briefly and then vanish from the archives, suggesting stories that never fully developed in public consciousness. This is exactly the kind of narrative gold that often gets overlooked.";
    }
    
    return { response, sideNote, showTreatment };
  };
  
  const { response, sideNote, showTreatment } = generateJordiResponse();
  
  // Generate a story arc label based on the query and results
  const generateArcLabel = () => {
    if (lowercaseQuery.includes('netflix') || lowercaseQuery.includes('treatment') || lowercaseQuery.includes('pitch')) {
      return "Creative Treatment";
    } else if (lowercaseQuery.includes('oil') || lowercaseQuery.includes('energy')) {
      return "Resource Crisis with Human Fallout";
    } else if (lowercaseQuery.includes('crime') || lowercaseQuery.includes('murder')) {
      return "True Crime Potential";
    } else if (lowercaseQuery.includes('watergate') || lowercaseQuery.includes('nixon')) {
      return "Political Thriller with Cascading Consequences";
    } else if (lowercaseQuery.includes('apollo') || lowercaseQuery.includes('moon')) {
      return "Technological Triumph with Hidden Heroes";
    } else if (lowercaseQuery.includes('sports') || lowercaseQuery.includes('athlete')) {
      return "Sports Narrative with Unexpected Complexity";
    } else if (lowercaseQuery.includes('women') || lowercaseQuery.includes('equality')) {
      return "Social Movement with Personal Stakes";
    } else {
      return "Emerging Historical Arc";
    }
  };
  
  return (
    <div className="bg-neutral-800/30 p-5 rounded-lg shadow-sm border border-neutral-700">
      {/* Jordi Persona Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center">
          <MessageCircle className="h-4 w-4 text-blue-400" />
        </div>
        <div className="text-blue-400 font-medium">Jordi</div>
        <div className="text-xs px-2 py-0.5 bg-neutral-700/50 rounded text-neutral-400">
          {generateArcLabel()}
        </div>
      </div>
      
      {/* Main Response */}
      <div className="pl-11">
        <p className="text-white mb-4">{response}</p>
        
        {/* Show Treatment if applicable */}
        {showTreatment && (
          <div className="mb-5 bg-neutral-800/70 rounded-lg p-4 border border-blue-900/30">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="h-4 w-4 text-blue-400" />
              <h3 className="text-lg font-medium text-white">{showTreatment.title}</h3>
            </div>
            <p className="text-blue-300 italic mb-3">{showTreatment.tagline}</p>
            <p className="text-neutral-300">{showTreatment.pitch}</p>
          </div>
        )}
        
        {/* Jordi's Side Note */}
        {sideNote && (
          <div className="bg-neutral-800/70 border-l-2 border-blue-500/40 pl-3 py-2 text-sm text-neutral-300 italic mb-4">
            {sideNote}
          </div>
        )}
        
        {/* Arc Summary */}
        {arcs.length > 0 && (
          <div className="mt-4 space-y-1">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-blue-400" />
              <div className="text-xs uppercase text-neutral-500 tracking-wider">Narrative Threads</div>
            </div>
            {arcs.map((arc, index) => (
              <div key={index} className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5"></div>
                <div>
                  <span className="text-blue-300">{arc.title}</span>
                  <span className="text-neutral-400 text-sm"> — {arc.summary.split('.')[0]}.</span>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Key Characters/Entities if relevant */}
        <div className="mt-4 space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <User className="h-4 w-4 text-blue-400" />
            <div className="text-xs uppercase text-neutral-500 tracking-wider">Key Figures</div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {lowercaseQuery.includes('oil') && (
              <>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5"></div>
                  <div>
                    <span className="text-blue-300">James Schlesinger</span>
                    <span className="text-neutral-400 text-sm"> — Energy Secretary</span>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5"></div>
                  <div>
                    <span className="text-blue-300">Sheikh Ahmed Yamani</span>
                    <span className="text-neutral-400 text-sm"> — Saudi Oil Minister</span>
                  </div>
                </div>
              </>
            )}
            
            {lowercaseQuery.includes('watergate') && (
              <>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5"></div>
                  <div>
                    <span className="text-blue-300">Martha Mitchell</span>
                    <span className="text-neutral-400 text-sm"> — Whistleblower</span>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5"></div>
                  <div>
                    <span className="text-blue-300">Alexander Butterfield</span>
                    <span className="text-neutral-400 text-sm"> — Revealed taping system</span>
                  </div>
                </div>
              </>
            )}
            
            {lowercaseQuery.includes('apollo') && (
              <>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5"></div>
                  <div>
                    <span className="text-blue-300">Margaret Hamilton</span>
                    <span className="text-neutral-400 text-sm"> — Software Engineer</span>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5"></div>
                  <div>
                    <span className="text-blue-300">Gene Kranz</span>
                    <span className="text-neutral-400 text-sm"> — Flight Director</span>
                  </div>
                </div>
              </>
            )}
            
            {lowercaseQuery.includes('sports') && (
              <>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5"></div>
                  <div>
                    <span className="text-blue-300">Jim Harrick</span>
                    <span className="text-neutral-400 text-sm"> — Basketball Coach</span>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5"></div>
                  <div>
                    <span className="text-blue-300">Robert Thompson</span>
                    <span className="text-neutral-400 text-sm"> — School Board President</span>
                  </div>
                </div>
              </>
            )}
            
            {lowercaseQuery.includes('women') && (
              <>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5"></div>
                  <div>
                    <span className="text-blue-300">Gloria Steinem</span>
                    <span className="text-neutral-400 text-sm"> — Activist & Writer</span>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5"></div>
                  <div>
                    <span className="text-blue-300">Betty Friedan</span>
                    <span className="text-neutral-400 text-sm"> — Author & Organizer</span>
                  </div>
                </div>
              </>
            )}
            
            {!(lowercaseQuery.includes('oil') || lowercaseQuery.includes('watergate') || 
               lowercaseQuery.includes('apollo') || lowercaseQuery.includes('sports') || 
               lowercaseQuery.includes('women')) && (
              <>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5"></div>
                  <div>
                    <span className="text-blue-300">Key historical figures</span>
                    <span className="text-neutral-400 text-sm"> — Would appear here</span>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5"></div>
                  <div>
                    <span className="text-blue-300">Institutional connections</span>
                    <span className="text-neutral-400 text-sm"> — Would be mapped here</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* Further Research Prompt */}
        <div className="mt-5 text-sm text-neutral-400">
          Ask me to expand on any aspect of these narratives or request a creative treatment.
        </div>
      </div>
    </div>
  );
};

export default NLQueryResponse; 