
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob } from '@google/genai';
import { askMentor } from '../services/geminiService';
import { MentorMessage, MasterySummary, UserProfile, GroundingSource } from '../types';
import { AcademicCapIcon, UserCircleIcon, SparklesIcon, ArrowRightIcon, MapIcon, BookOpenIcon, StarIcon } from './icons/Icons';
import { CHAPTERS } from '../constants';

// Audio Helpers (Manual implementation per instructions)
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

interface AITutorProps {
    masterySummary: MasterySummary;
    profile: UserProfile;
}

const AITutor: React.FC<AITutorProps> = ({ masterySummary, profile }) => {
    const [conversation, setConversation] = useState<MentorMessage[]>([]);
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isLiveActive, setIsLiveActive] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasKey, setHasKey] = useState<boolean | null>(null);
    
    // Live Audio Refs
    const sessionPromiseRef = useRef<any>(null);
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const nextStartTimeRef = useRef<number>(0);
    const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const liveTranscriptionRef = useRef({ input: '', output: '' });

    useEffect(() => {
        const checkKey = async () => {
            if (window.aistudio?.hasSelectedApiKey) {
                const result = await window.aistudio.hasSelectedApiKey();
                setHasKey(result);
            }
        };
        checkKey();
    }, []);

    const handleOpenKeyDialog = async () => {
        if (window.aistudio?.openSelectKey) {
            await window.aistudio.openSelectKey();
            setHasKey(true); // Proceed assuming success per instructions
        }
    };

    // Initial Greeting
    useEffect(() => {
        const weakTopic = masterySummary.weakChapters[0];
        const gradeChapters = CHAPTERS[profile.grade] || {};
        const subjectCount = Object.keys(gradeChapters).length;
        
        const greeting = weakTopic 
            ? `Namaste ${profile.name}! I'm your Class ${profile.grade} mentor. I see you're finding ${weakTopic.chapter} a bit tricky. We have the full Class ${profile.grade} syllabus loaded for ${subjectCount} subjects. How can I help you? I can fetch real diagrams from textbooks for you!`
            : `Hello ${profile.name}! I am your AI Mentor. I have the complete CBSE Class ${profile.grade} syllabus ready for you. You can ask me about any chapter from your subjects. What would you like to study today?`;
        
        setConversation([{ author: 'tutor', text: greeting }]);
    }, [masterySummary, profile]);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [conversation, isLoading, isLiveActive]);

    const stopLiveSession = useCallback(() => {
        if (sessionPromiseRef.current) {
            sessionPromiseRef.current.then((session: any) => session.close());
            sessionPromiseRef.current = null;
        }
        if (inputAudioContextRef.current) {
            inputAudioContextRef.current.close();
            inputAudioContextRef.current = null;
        }
        if (outputAudioContextRef.current) {
            outputAudioContextRef.current.close();
            outputAudioContextRef.current = null;
        }
        for (const source of sourcesRef.current) {
            source.stop();
        }
        sourcesRef.current.clear();
        setIsLiveActive(false);
    }, []);

    const startLiveSession = async () => {
        if (!hasKey) {
            setError("Pro Voice Mode requires an API key selection first.");
            return;
        }
        try {
            setError(null);
            setIsLiveActive(true);
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            nextStartTimeRef.current = 0;

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            sessionPromiseRef.current = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-12-2025',
                callbacks: {
                    onopen: () => {
                        const source = inputAudioContextRef.current!.createMediaStreamSource(stream);
                        const scriptProcessor = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
                        scriptProcessor.onaudioprocess = (e) => {
                            const inputData = e.inputBuffer.getChannelData(0);
                            const l = inputData.length;
                            const int16 = new Int16Array(l);
                            for (let i = 0; i < l; i++) int16[i] = inputData[i] * 32768;
                            const pcmBlob: Blob = {
                                data: encode(new Uint8Array(int16.buffer)),
                                mimeType: 'audio/pcm;rate=16000',
                            };
                            sessionPromiseRef.current.then((session: any) => {
                                session.sendRealtimeInput({ media: pcmBlob });
                            });
                        };
                        source.connect(scriptProcessor);
                        scriptProcessor.connect(inputAudioContextRef.current!.destination);
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        if (message.serverContent?.inputTranscription) {
                            liveTranscriptionRef.current.input += message.serverContent.inputTranscription.text;
                        }
                        if (message.serverContent?.outputTranscription) {
                            liveTranscriptionRef.current.output += message.serverContent.outputTranscription.text;
                        }

                        if (message.serverContent?.turnComplete) {
                            const input = liveTranscriptionRef.current.input;
                            const output = liveTranscriptionRef.current.output;
                            if (input || output) {
                                setConversation(prev => [
                                    ...prev,
                                    ...(input ? [{ author: 'user' as const, text: input }] : []),
                                    ...(output ? [{ author: 'tutor' as const, text: output }] : [])
                                ]);
                            }
                            liveTranscriptionRef.current = { input: '', output: '' };
                        }

                        const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                        if (audioData && outputAudioContextRef.current) {
                            const ctx = outputAudioContextRef.current;
                            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
                            const audioBuffer = await decodeAudioData(decode(audioData), ctx, 24000, 1);
                            const source = ctx.createBufferSource();
                            source.buffer = audioBuffer;
                            source.connect(ctx.destination);
                            source.start(nextStartTimeRef.current);
                            nextStartTimeRef.current += audioBuffer.duration;
                            sourcesRef.current.add(source);
                            source.onended = () => sourcesRef.current.delete(source);
                        }

                        if (message.serverContent?.interrupted) {
                            for (const source of sourcesRef.current) source.stop();
                            sourcesRef.current.clear();
                            nextStartTimeRef.current = 0;
                        }
                    },
                    onerror: () => setError('Audio session error. Try again.'),
                    onclose: () => setIsLiveActive(false)
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    systemInstruction: `You are the Alfanumrik AI Tutor for Class ${profile.grade} CBSE. Voice interaction active. You have access to the complete Class ${profile.grade} syllabus chapters for ${profile.selectedSubjects.join(', ')}. Be conversational. Fetch real data using search grounding.`,
                    speechConfig: {
                        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } }
                    },
                    inputAudioTranscription: {},
                    outputAudioTranscription: {}
                }
            });
        } catch (e) {
            setError('Could not access microphone.');
            setIsLiveActive(false);
        }
    };

    const handleTextSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim() || isLoading) return;
        if (!hasKey) {
            setError("Grounded AI Tutor requires an API key for search access.");
            return;
        }

        setError(null);
        const userMessage: MentorMessage = { author: 'user', text: query.trim() };
        setConversation(prev => [...prev, userMessage]);
        setQuery('');
        setIsLoading(true);

        try {
            const contextPrompt = `
                Student Profile: Class ${profile.grade}
                Subjects Focus: ${profile.selectedSubjects.join(', ')}
                Performance Context: ${masterySummary.overallAccuracy.toFixed(1)}% Accuracy.
                Instruction: Use Google Search Grounding. Cite REAL PICTURES and academic sources. 
                Answer using official CBSE Class ${profile.grade} curriculum standards.
                Student's Multilingual Query: "${userMessage.text}"
            `;
            const result = await askMentor(contextPrompt);
            setConversation(prev => [...prev, {
                author: 'tutor',
                text: result.answer,
                sources: result.sources
            }]);
        } catch (err: any) {
            if (err.message?.includes("Requested entity was not found")) {
                setHasKey(false);
                setError("Your API key session expired. Please re-select your key.");
            } else {
                setError('The grounded tutor is currently busy.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-6rem)] max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden animate-fade-in relative">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white/80 backdrop-blur-sm sticky top-0 z-10">
                <div className="flex items-center">
                    <div className="p-3 bg-indigo-700 rounded-2xl mr-4 shadow-xl shadow-indigo-100">
                        <AcademicCapIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-gray-800 uppercase tracking-tighter">AI Mentor</h1>
                        <div className="flex items-center gap-2">
                             <span className="text-[10px] text-indigo-600 font-black uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded-full">Grounded • Class ${profile.grade}</span>
                             <span className={`text-[10px] font-black uppercase tracking-widest flex items-center ${hasKey ? 'text-green-500' : 'text-amber-500'}`}>
                                <div className={`h-1.5 w-1.5 rounded-full mr-1.5 ${hasKey ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`} /> 
                                {hasKey ? 'Syllabus Grounding Active' : 'API Key Required'}
                             </span>
                        </div>
                    </div>
                </div>
                {!hasKey && (
                    <button 
                        onClick={handleOpenKeyDialog}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-indigo-700 transition-all"
                    >
                        <StarIcon className="h-4 w-4" /> Unlock Pro Tutor
                    </button>
                )}
            </div>

            {/* Chat Area */}
            <div ref={chatContainerRef} className="flex-1 p-6 overflow-y-auto space-y-6 bg-gray-50/30">
                {conversation.map((msg, index) => (
                    <div key={index} className={`flex items-start gap-3 ${msg.author === 'user' ? 'justify-end' : ''}`}>
                        {msg.author === 'tutor' && (
                            <div className="p-2 bg-indigo-600 rounded-xl text-white mt-1 shadow-lg shrink-0">
                                <AcademicCapIcon className="w-5 h-5" />
                            </div>
                        )}
                        <div className={`max-w-[85%] p-5 rounded-3xl shadow-sm ${
                            msg.author === 'tutor' 
                                ? 'bg-white text-gray-800 border border-gray-100' 
                                : 'bg-indigo-700 text-white shadow-indigo-100 shadow-md'
                        }`}>
                            <p className="whitespace-pre-wrap text-sm leading-relaxed font-medium">
                                {msg.text.replace(/\*\*(.*?)\*\*/g, '$1')}
                            </p>
                             
                             {/* Grounding Sources (Real Pictures/Data) */}
                             {msg.sources && msg.sources.length > 0 && (
                                 <div className="mt-6 space-y-3">
                                     <div className="flex items-center gap-2 mb-2">
                                         <MapIcon className="h-4 w-4 text-indigo-500" />
                                         <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Verified Academic Sources</span>
                                     </div>
                                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                         {msg.sources.map((src, i) => (
                                             <a 
                                                key={i} 
                                                href={src.uri} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-3 p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 hover:bg-indigo-50 transition-all group"
                                             >
                                                 <div className="p-2 bg-white rounded-lg shadow-sm">
                                                     <BookOpenIcon className="h-4 w-4 text-indigo-600" />
                                                 </div>
                                                 <div className="flex-1 min-w-0">
                                                     <p className="text-[10px] font-black text-indigo-700 truncate">{src.title}</p>
                                                     <p className="text-[8px] text-gray-400 font-bold uppercase truncate">Real Diagram Link</p>
                                                 </div>
                                                 <ArrowRightIcon className="h-3 w-3 text-indigo-400 group-hover:translate-x-1 transition-transform" />
                                             </a>
                                         ))}
                                     </div>
                                 </div>
                             )}
                        </div>
                         {msg.author === 'user' && (
                            <div className="p-2 bg-gray-200 rounded-xl text-gray-600 mt-1 shadow-sm shrink-0">
                                <UserCircleIcon className="w-5 h-5" />
                            </div>
                         )}
                    </div>
                ))}
                
                {isLiveActive && (
                    <div className="flex flex-col items-center justify-center p-8 space-y-4 animate-fade-in bg-indigo-50/50 rounded-3xl border border-indigo-100 border-dashed">
                        <div className="flex items-center gap-1 h-8">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="w-1.5 bg-indigo-500 rounded-full animate-pulse" style={{ height: `${20 + Math.random() * 60}%`, animationDelay: `${i * 0.1}s` }} />
                            ))}
                        </div>
                        <p className="text-xs font-black text-indigo-700 uppercase tracking-widest animate-pulse">Mentor is listening...</p>
                        <button onClick={stopLiveSession} className="px-6 py-2 bg-red-500 text-white text-[10px] font-black uppercase rounded-full shadow-lg hover:bg-red-600 transition-all">End Voice Chat</button>
                    </div>
                )}

                {isLoading && (
                    <div className="flex items-center gap-3 animate-pulse">
                         <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-lg"><AcademicCapIcon className="w-5 h-5" /></div>
                         <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-2">
                             <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                             <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                             <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                         </div>
                    </div>
                )}
                {error && <div className="text-center p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 font-bold text-xs uppercase tracking-widest">{error}</div>}
            </div>

            {/* Input Footer */}
            <div className="p-6 border-t border-gray-100 bg-white/80 backdrop-blur-sm">
                {!hasKey ? (
                    <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 text-center">
                        <p className="text-xs font-bold text-amber-800 mb-3 uppercase tracking-widest">A Paid API Key is required for Grounded Search.</p>
                        <button 
                            onClick={handleOpenKeyDialog}
                            className="bg-amber-600 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] shadow-lg hover:bg-amber-700 transition-all"
                        >
                            Select Paid API Key
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleTextSubmit} className="flex items-center gap-3">
                        {!isLiveActive && (
                            <button 
                                type="button" 
                                onClick={startLiveSession}
                                className="p-4 bg-white border border-gray-200 text-indigo-600 rounded-full hover:bg-indigo-50 transition-all shadow-md group"
                            >
                                <MicIcon className="h-6 w-6 group-hover:scale-110 transition-transform" />
                            </button>
                        )}
                        <div className="flex-1 flex items-center gap-4 bg-gray-50 p-2 pl-4 rounded-[2rem] border border-gray-200 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-50 transition-all">
                            <textarea 
                                value={query} 
                                onChange={(e) => setQuery(e.target.value)} 
                                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleTextSubmit(e); } }} 
                                placeholder={isLiveActive ? "Voice mode active..." : "Ask about any chapter or concept..."} 
                                className="flex-1 p-2 bg-transparent border-none focus:ring-0 text-sm font-medium resize-none text-gray-900 leading-tight" 
                                rows={1} 
                                disabled={isLoading || isLiveActive} 
                            />
                            <button 
                                type="submit" 
                                disabled={isLoading || !query.trim() || isLiveActive} 
                                className="bg-indigo-700 text-white p-4 rounded-full shadow-lg shadow-indigo-200 hover:bg-indigo-800 disabled:opacity-50 transition-all active:scale-95"
                            >
                                <ArrowRightIcon className="h-5 w-5" />
                            </button>
                        </div>
                    </form>
                )}
                <p className="text-center text-[9px] text-gray-400 mt-3 font-black uppercase tracking-widest">Explore your Class ${profile.grade} CBSE syllabus in detail.</p>
            </div>
        </div>
    );
};

const MicIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
    </svg>
);

export default AITutor;
