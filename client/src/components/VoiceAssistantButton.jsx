import React, { useState, useEffect, useRef } from 'react';
import Vapi from '@vapi-ai/web';
import { Mic, Square, Loader2 } from 'lucide-react';

const PUBLIC_KEY = 'ff81d090-211b-4cab-ac9a-43e74b3a87ba';
const ASSISTANT_ID = '928d60e5-7d35-492b-bf75-b956bf584700';

export default function VoiceAssistantButton() {
    const [callStatus, setCallStatus] = useState('inactive'); // 'inactive', 'loading', 'active'
    const [volumeLevel, setVolumeLevel] = useState(0);
    const [transcripts, setTranscripts] = useState([]);
    const vapiRef = useRef(null);
    const transcriptRef = useRef(null);

    useEffect(() => {
        if (transcriptRef.current) {
            transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
        }
    }, [transcripts]);

    useEffect(() => {
        vapiRef.current = new Vapi(PUBLIC_KEY);

        vapiRef.current.on('call-start', () => {
            console.log("Vapi Call connected successfully!");
            setCallStatus('active');
            setTranscripts([{ role: 'assistant', text: 'Call connected! I am listening...' }]);
        });
        
        vapiRef.current.on('call-end', () => {
            setCallStatus('inactive');
            setTimeout(() => setTranscripts([]), 1000);
        });
        
        vapiRef.current.on('volume-level', (level) => {
            setVolumeLevel(level);
        });

        vapiRef.current.on('message', (message) => {
            if (message.type === 'transcript' && message.transcriptType === 'final') {
                // Ensure transcript exists before adding to avoid empty bubbles
                if (message.transcript && message.transcript.trim() !== '') {
                    setTranscripts(prev => [...prev, { role: message.role, text: message.transcript }]);
                }
            } else if (message.type === 'function-call') {
                 // optionally handle function calls visually
            }
        });

        vapiRef.current.on('error', (e) => {
            console.error("Vapi event error:", e);
            setCallStatus('inactive');
            alert("Vapi Connection Error: " + (e?.message || "Check your Browser Console"));
        });

        return () => {
            if (vapiRef.current) {
                vapiRef.current.stop();
                vapiRef.current.removeAllListeners();
            }
        };
    }, []);

    const toggleCall = async () => {
        if (callStatus === 'inactive') {
            setCallStatus('loading');
            try {
                const response = await vapiRef.current.start(ASSISTANT_ID);
                console.log("Start response:", response);
            } catch (e) {
                console.error("Vapi start exception:", e);
                setCallStatus('inactive');
                alert("Failed to connect to AI: " + (e?.message || "Check your Browser Console for errors. Your API Key or Assistant ID might be invalid."));
            }
        } else {
            vapiRef.current.stop();
        }
    };

    return (
        <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-3">
            {callStatus === 'active' && (
                <div className="bg-[#1a1a1a] border border-[#333] w-80 h-72 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
                    <div className="bg-[#111] px-4 py-3 border-b border-[#222] flex items-center justify-between">
                        <span className="text-[10px] font-bold tracking-widest text-[#ccff00] animate-pulse flex items-center gap-2">
                             <div className="w-2 h-2 rounded-full bg-[#ccff00]"></div>
                             LIVE TRANSCRIPT
                        </span>
                    </div>
                    <div ref={transcriptRef} className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-none flex flex-col">
                        {transcripts.map((t, i) => (
                            <div key={i} className={`max-w-[85%] rounded-xl p-3 text-[13px] font-medium leading-relaxed tracking-wide ${
                                t.role === 'user' 
                                ? 'bg-[#222] text-white self-end rounded-tr-sm border border-[#333]' 
                                : 'bg-[#111] text-gray-300 self-start border border-[#ccff00]/30 shadow-lg shadow-[#ccff00]/5'
                            }`}>
                                <span className={`text-[9px] uppercase tracking-widest font-bold block mb-1 ${t.role === 'user' ? 'text-gray-500' : 'text-[#ccff00]'}`}>
                                    {t.role === 'user' ? 'You' : 'Rasputin'}
                                </span>
                                {t.text}
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            <button
                onClick={toggleCall}
                style={{
                    transform: callStatus === 'active' ? `scale(${1 + volumeLevel * 0.5})` : 'scale(1)',
                    transition: 'transform 0.1s ease-in-out'
                }}
                className={`flex items-center justify-center w-16 h-16 rounded-full shadow-[0_0_20px_rgba(0,0,0,0.5)] transition-all duration-300 ${
                    callStatus === 'active' 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'bg-[#ccff00] hover:bg-[#b3e600] text-black'
                }`}
            >
                {callStatus === 'loading' ? (
                    <Loader2 className="w-8 h-8 animate-spin" />
                ) : callStatus === 'active' ? (
                    <Square className="w-6 h-6 fill-current" />
                ) : (
                    <Mic className="w-8 h-8" />
                )}
            </button>
        </div>
    );
}
