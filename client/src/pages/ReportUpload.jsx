
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, AlertCircle, CheckCircle, Loader2, Calendar, ChevronRight, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { endpoints } from '../config';

export default function ReportUpload() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [queue, setQueue] = useState([]);
    const [processingIndex, setProcessingIndex] = useState(-1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // List of saved documents
    const [documents, setDocuments] = useState([]);
    // Currently selected/expanded document
    const [expandedDoc, setExpandedDoc] = useState(null);

    // 1. Load Documents from Supabase
    useEffect(() => {
        if (!user) return;
        const fetchReports = async () => {
            // If we are in "Demo Mode" (no supabase), fallback to localStorage
            if (!supabase) {
                const key = "user_documents_" + user.email;
                try {
                    const saved = localStorage.getItem(key);
                    if (saved) setDocuments(JSON.parse(saved));
                } catch (e) { }
                return;
            }

            const { data, error } = await supabase
                .from('reports')
                .select('*')
                .order('created_at', { ascending: false });

            if (data) {
                const validDocs = data.map(row => ({
                    id: row.id,
                    name: row.file_name,
                    date: new Date(row.created_at).toLocaleDateString(),
                    ...row.analysis_json
                }));
                setDocuments(validDocs);
            }
        };
        fetchReports();
    }, [user]);

    // Process the Queue
    const handleBatchAnalyze = async () => {
        if (queue.length === 0) return;
        setLoading(true);
        setProcessingIndex(0);
        setError(null);

        // We process sequentially to avoid overwhelming the backend/rate limits
        const newDocs = [];

        for (let i = 0; i < queue.length; i++) {
            setProcessingIndex(i);
            const currentFile = queue[i];
            console.log(`Starting analysis for file: ${currentFile.name}`);

            const formData = new FormData();
            formData.append('file', currentFile);

            try {
                console.log(`Sending POST request to ${endpoints.analyze}...`);
                const response = await fetch(endpoints.analyze, {
                    method: 'POST',
                    body: formData,
                });
                console.log(`Received Response Status: ${response.status}`);

                if (!response.ok) {
                    const errText = await response.text();
                    console.error("API Error Response:", errText);
                    let errData;
                    try {
                        errData = JSON.parse(errText);
                    } catch (parseErr) {
                        throw new Error(`Server returned ${response.status}: ${errText}`);
                    }
                    throw new Error(errData.detail || "Failed to analyze " + currentFile.name);
                }

                const data = await response.json();
                console.log("Parsed JSON Data successfully:", data);

                const newDoc = {
                    id: Date.now() + i, // ensure unique ID
                    name: currentFile.name,
                    date: new Date().toLocaleDateString(),
                    ...data
                };

                newDocs.push(newDoc);

                // SAVE INDIVIDUAL DOC TO CLOUD (Supabase)
                if (user?.email && supabase) {
                    await supabase.from('reports').insert({
                        user_id: user.id,
                        file_name: currentFile.name,
                        analysis_json: data
                    });
                }

            } catch (err) {
                console.error("Fetch Exception generated:", err);
                setError("Error on " + currentFile.name + ": " + err.message);
                // Continue to next file even if one fails
            }
        }

        // Update Local State with all new docs
        const updatedDocs = [...newDocs, ...documents];
        setDocuments(updatedDocs);

        // Final Sync for Fallback
        if (user?.email && !supabase) {
            localStorage.setItem("user_documents_" + user.email, JSON.stringify(updatedDocs));
        }

        setQueue([]); // Clear Queue
        setProcessingIndex(-1);
        setLoading(false);
    };

    // Handle File Selection (Multiple)
    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setQueue(Array.from(e.target.files));
            setError(null);
        }
    };

    const toggleExpand = (doc) => {
        if (expandedDoc?.id === doc.id) {
            setExpandedDoc(null);
        } else {
            setExpandedDoc(doc);
        }
    };

    const handleLoadToDashboard = (doc) => {
        if (!user?.email) return;
        // Save this specific doc as the "Active" dashboard analysis
        localStorage.setItem("dashboard_analysis_" + user.email, JSON.stringify(doc));
        // Redirect to dashboard
        navigate('/');
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-5xl font-display text-white tracking-wide uppercase">Your Documents</h2>
                    <div className="inline-block mt-2 bg-[#333333] px-3 py-1 rounded-full text-sm font-medium text-gray-300">
                        MEDICAL ARCHIVE
                    </div>
                </div>

                {/* Upload Trigger */}
                <div className="relative">
                    <input
                        type="file"
                        id="new-upload"
                        onChange={handleFileChange}
                        accept=".pdf,image/*"
                        multiple // ENABLE MULTIPLE
                        className="hidden"
                    />
                    <label
                        htmlFor="new-upload"
                        className="flex items-center gap-2 px-8 py-3 bg-racing-accent hover:bg-racing-accentHover text-[#111111] font-display text-2xl tracking-widest rounded-full cursor-pointer transition-colors shadow-lg shadow-racing-accent/20"
                    >
                        <Upload size={20} />
                        {queue.length > 0 ? "ADD MORE" : "UPLOAD NEW"}
                    </label>
                </div>
            </div>

            {/* Analysis Loading State Over The List */}
            {loading && (
                <div className="p-8 bg-slate-900/50 border border-slate-700 rounded-2xl flex flex-col items-center justify-center text-blue-400">
                    <Loader2 className="w-10 h-10 animate-spin mb-4" />
                    <p className="text-lg font-medium">
                        Analyzing File {processingIndex + 1} of {queue.length}...
                    </p>
                    <p className="text-sm text-slate-500 mt-2">{queue[processingIndex]?.name}</p>
                </div>
            )}

            {/* Queue Confirmation */}
            {queue.length > 0 && !loading && (
                <div className="bg-racing-card border-2 border-racing-accent p-6 rounded-3xl space-y-4 shadow-xl shadow-racing-accent/5">
                    <div className="flex items-center justify-between border-b border-[#333] pb-4">
                        <div className="flex items-center gap-3">
                            <FileText className="text-racing-accent" />
                            <span className="text-gray-300 font-display text-xl tracking-wide uppercase">Selected <span className="font-bold text-white">{queue.length} files</span></span>
                        </div>
                        <button
                            onClick={() => setQueue([])}
                            className="px-4 py-1 text-sm bg-[#222] hover:bg-[#333] text-gray-300 rounded-full transition-colors font-bold uppercase tracking-widest"
                        >
                            CLEAR
                        </button>
                    </div>

                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                        {queue.map((f, i) => (
                            <div key={i} className="text-sm text-gray-400 flex items-center gap-3 font-medium">
                                <span className="w-2 h-2 rounded-full bg-racing-accent" />
                                {f.name}
                            </div>
                        ))}
                    </div>

                    <div className="pt-4">
                        <button
                            onClick={handleBatchAnalyze}
                            className="w-full py-4 bg-racing-accent hover:bg-racing-accentHover text-[#111111] rounded-xl font-display text-2xl tracking-widest uppercase transition-all shadow-xl shadow-racing-accent/20"
                        >
                            SAVE & ANALYZE ALL
                        </button>
                    </div>
                </div>
            )}

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 flex items-center gap-3">
                    <AlertCircle /> {error}
                </div>
            )}

            {/* Documents List */}
            <div className="space-y-4">
                {documents.length === 0 && !loading && (
                    <div className="text-center py-20 text-slate-600 border-2 border-dashed border-slate-800 rounded-3xl">
                        <FileText className="w-16 h-16 mx-auto mb-4 opacity-20" />
                        <p>No documents found.</p>
                    </div>
                )}

                {documents.map((doc) => (
                    <div key={doc.id} className="bg-racing-card border border-[#2a2a2a] rounded-3xl overflow-hidden transition-all hover:border-racing-accent group">
                        {/* Card Header */}
                        <div
                            onClick={() => toggleExpand(doc)}
                            className="p-6 flex items-center justify-between cursor-pointer hover:bg-[#222]"
                        >
                            <div className="flex items-center gap-5">
                                <div className="w-12 h-12 bg-[#222] rounded-full flex items-center justify-center text-racing-accent font-display text-2xl pt-1">
                                    {doc.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-lg leading-tight">{doc.name}</h3>
                                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1 font-bold uppercase tracking-wider">
                                        <Calendar size={12} /> {doc.date} &bull; {doc.metrics?.length || 0} METRICS
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleLoadToDashboard(doc);
                                    }}
                                    className="text-[#111111] bg-racing-accent px-4 py-2 rounded-full font-display tracking-widest uppercase hover:bg-racing-accentHover transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    OPEN DASHBOARD
                                </button>
                                <div className="text-gray-500 bg-[#222] p-2 rounded-full">
                                    {expandedDoc?.id === doc.id ? <ChevronDown /> : <ChevronRight />}
                                </div>
                            </div>
                        </div>

                        {/* Expanded Details */}
                        {expandedDoc?.id === doc.id && (
                            <div className="border-t border-slate-800 p-6 bg-slate-950/30">
                                {/* Summary */}
                                {doc.overall_summary && (
                                    <div className="mb-6 bg-blue-500/5 p-4 rounded-xl border border-blue-500/10">
                                        <h4 className="text-xs font-bold text-blue-400 uppercase mb-2">AI Summary</h4>
                                        <p className="text-sm text-slate-300 leading-relaxed">{doc.overall_summary}</p>
                                    </div>
                                )}

                                {/* Metrics Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {doc.metrics?.map((m, i) => (
                                        <div key={i} className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex justify-between items-center">
                                            <div>
                                                <div className="text-xs text-slate-400">{m.name}</div>
                                                <div className="text-sm font-bold text-white">{m.value} <span className="text-[10px] text-slate-500">{m.unit}</span></div>
                                            </div>
                                            <span className={"text-[10px] px-2 py-1 rounded border " + (m.status === 'Normal' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20')}>
                                                {m.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
