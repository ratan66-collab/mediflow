import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, AlertCircle, CheckCircle, Loader2, Calendar, ChevronRight, ChevronDown, Trash2 } from 'lucide-react';
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
    const [processingListId, setProcessingListId] = useState(null); // Track individually analyzed docs

    // List of saved documents
    const [documents, setDocuments] = useState([]);
    // Currently selected/expanded document
    const [expandedDoc, setExpandedDoc] = useState(null);

    // 1. Load Documents from Supabase / Memory
    useEffect(() => {
        if (!user) return;
        const fetchReports = async () => {
            let cloudFailed = false;
            if (supabase) {
                try {
                    const { data, error } = await supabase
                        .from('reports')
                        .select('*')
                        .order('created_at', { ascending: false });

                    if (data && !error) {
                        const validDocs = data.map(row => ({
                            id: row.id,
                            name: row.file_name,
                            date: new Date(row.created_at).toLocaleDateString(),
                            ...row.analysis_json
                        }));
                        setDocuments(validDocs);
                        return; // Successfully fetched from cloud
                    } else {
                        cloudFailed = true;
                    }
                } catch(e) {
                    cloudFailed = true;
                }
            } else {
                cloudFailed = true;
            }

            if (cloudFailed) {
                const key = "user_documents_" + user.email;
                try {
                    const saved = localStorage.getItem(key);
                    if (saved) setDocuments(JSON.parse(saved));
                } catch (e) { }
            }
        };
        fetchReports();
    }, [user]);

    // Helpers to convert to Base64 to manually cache the raw file when bypassing backend analysis
    const fileToBase64 = (file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });

    const handleSaveOnly = async () => {
        if (queue.length === 0) return;
        setLoading(true);
        setError(null);
        
        try {
            const newDocs = [];
            for (let i = 0; i < queue.length; i++) {
                const currentFile = queue[i];
                const base64Data = await fileToBase64(currentFile);
                newDocs.push({
                    id: Date.now() + i,
                    name: currentFile.name,
                    date: new Date().toLocaleDateString(),
                    fileData: base64Data, // Save raw DataURL
                    metrics: null // Null metrics means it's unanalyzed
                });
            }

            const updatedDocs = [...newDocs, ...documents];
            setDocuments(updatedDocs);

            if (user?.email) {
                try {
                    localStorage.setItem("user_documents_" + user.email, JSON.stringify(updatedDocs));
                } catch (storageError) {
                    console.warn("Local storage limit reached. File will be kept in memory for this session.");
                }
            }
            
            setQueue([]);
        } catch(e) {
            setError("Cannot process document format. Please try another PDF.");
        } finally {
            setLoading(false);
        }
    };

    // Process the Queue Fully
    const handleBatchAnalyze = async () => {
        if (queue.length === 0) return;
        setLoading(true);
        setProcessingIndex(0);
        setError(null);

        const newDocs = [];

        for (let i = 0; i < queue.length; i++) {
            setProcessingIndex(i);
            const currentFile = queue[i];

            const formData = new FormData();
            formData.append('file', currentFile);

            try {
                const response = await fetch(endpoints.analyze, {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) {
                    const errData = await response.json();
                    throw new Error(errData.detail || 'Failed to analyze report');
                }

                const data = await response.json();

                const newDoc = {
                    id: Date.now() + i,
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
                    }).catch(e => console.log('supaerr'));
                }
            } catch (err) {
                setError("Error on " + currentFile.name + ": " + err.message);
            }
        }

        const updatedDocs = [...newDocs, ...documents];
        setDocuments(updatedDocs);

        if (user?.email) {
            try {
                localStorage.setItem("user_documents_" + user.email, JSON.stringify(updatedDocs));
            } catch(e){
                console.warn("Storage limits hit. Results kept in memory.");
            }
        }

        setQueue([]); // Clear Queue
        setProcessingIndex(-1);
        setLoading(false);
    };

    // Trigger explicit Analysis from List UI
    const handleAnalyzeFromList = async (e, docToAnalyze) => {
        e.stopPropagation();
        if (!docToAnalyze.fileData) {
            setError("Original file data is missing or corrupted. Please re-upload.");
            return;
        }

        setProcessingListId(docToAnalyze.id);
        setError(null);
        
        try {
            // Convert base64 back to simulated file
            const res = await fetch(docToAnalyze.fileData);
            const blob = await res.blob();
            const file = new File([blob], docToAnalyze.name, { type: blob.type || 'application/pdf' });

            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch(endpoints.analyze, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || 'Failed to analyze report');
            }

            const data = await response.json();

            // Update main state safely substituting the null fields with fresh Gemini AI responses
            const updatedDocs = documents.map(d => {
                if (d.id === docToAnalyze.id) {
                    return { ...d, ...data, fileData: null }; // clear base64 from doc obj to save storage scope
                }
                return d;
            });

            setDocuments(updatedDocs);
            if (user?.email) localStorage.setItem("user_documents_" + user.email, JSON.stringify(updatedDocs));

        } catch(err) {
            setError("Analysis failed: " + err.message);
        } finally {
            setProcessingListId(null);
        }
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
        localStorage.setItem("dashboard_analysis_" + user.email, JSON.stringify(doc));
        navigate('/');
    };

    const handleDeleteDocument = async (e, docId) => {
        e.stopPropagation();
        
        // Remove from UI state
        const updatedDocs = documents.filter(d => d.id !== docId);
        setDocuments(updatedDocs);
        
        // Remove from local memory
        if (user?.email) {
            localStorage.setItem("user_documents_" + user.email, JSON.stringify(updatedDocs));
        }

        // Try deleting from Supabase
        if (user && supabase) {
            try {
                await supabase.from('reports').delete().eq('id', docId);
            } catch(err) {} 
        }
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

                    {/* SPLIT ACTION BUTTONS FOR STORAGE */}
                    <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                            onClick={handleSaveOnly}
                            className="w-full py-4 bg-[#111111] hover:bg-[#222222] border-2 border-dashed border-[#555] text-gray-300 rounded-xl font-display text-xl tracking-widest uppercase transition-all shadow-xl"
                        >
                            SAVE FOR LATER
                        </button>
                        <button
                            onClick={handleBatchAnalyze}
                            className="w-full py-4 bg-racing-accent hover:bg-racing-accentHover text-[#111111] rounded-xl font-display text-xl tracking-widest uppercase transition-all shadow-xl shadow-racing-accent/20"
                        >
                            ANALYZE IMMEDIATELY
                        </button>
                    </div>
                </div>
            )}

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 font-bold flex items-center gap-3 uppercase tracking-widest">
                    <AlertCircle /> {error}
                </div>
            )}

            {/* Documents List */}
            <div className="space-y-4">
                {documents.length === 0 && !loading && (
                    <div className="text-center py-20 text-slate-600 border-2 border-dashed border-[#2a2a2a] rounded-3xl">
                        <FileText className="w-16 h-16 mx-auto mb-4 opacity-20 text-racing-accent" />
                        <p className="font-display tracking-widest text-xl uppercase text-[#666]">No documents found in archive.</p>
                    </div>
                )}

                {documents.map((doc) => (
                    <div key={doc.id} className="bg-racing-card border border-[#2a2a2a] rounded-3xl overflow-hidden transition-all hover:border-racing-accent group">
                        {/* Card Header */}
                        <div
                            onClick={() => doc.metrics && toggleExpand(doc)}
                            className={`p-6 flex flex-col md:flex-row md:items-center justify-between transition-colors ${doc.metrics ? 'cursor-pointer hover:bg-[#222]' : 'cursor-default'} gap-4`}
                        >
                            <div className="flex items-center gap-5">
                                <div className="w-12 h-12 bg-[#222] rounded-full flex items-center justify-center text-racing-accent font-display text-2xl pt-1 flex-shrink-0">
                                    {doc.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h3 className="text-white font-bold text-lg leading-tight truncate">{doc.name}</h3>
                                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1 font-bold uppercase tracking-wider">
                                        <Calendar size={12} /> {doc.date} &bull; {doc.metrics ? 'ANALYZED FILE' : 'UNANALYZED FILE'}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-4 self-end md:self-center">
                                <button
                                    onClick={(e) => handleDeleteDocument(e, doc.id)}
                                    className="p-2.5 text-[#555] hover:text-red-500 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 rounded-full transition-all"
                                    title="Delete Document"
                                >
                                    <Trash2 size={20} />
                                </button>
                                
                                {doc.metrics ? (
                                    <>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleLoadToDashboard(doc);
                                            }}
                                            className="text-[#111111] bg-racing-accent px-4 py-2 rounded-full font-display tracking-widest uppercase hover:bg-racing-accentHover transition-colors opacity-0 group-hover:opacity-100 shadow-md shadow-racing-accent/20"
                                        >
                                            OPEN DASHBOARD
                                        </button>
                                        <div className="text-racing-accent bg-[#222] p-2 rounded-full hidden md:block">
                                            {expandedDoc?.id === doc.id ? <ChevronDown /> : <ChevronRight />}
                                        </div>
                                    </>
                                ) : (
                                    <button
                                        onClick={(e) => handleAnalyzeFromList(e, doc)}
                                        disabled={processingListId === doc.id}
                                        className="text-[#111111] bg-[#bef264] px-6 py-2.5 rounded-full font-display tracking-widest uppercase hover:bg-[#a3d83b] transition-all flex items-center gap-2 shadow-lg shadow-[#bef264]/20 border border-[#a3d83b]"
                                    >
                                        {processingListId === doc.id ? <Loader2 className="animate-spin" size={16} /> : null}
                                        {processingListId === doc.id ? "ANALYZING..." : "ANALYZE NOW"}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Expanded Details */}
                        {expandedDoc?.id === doc.id && doc.metrics && (
                            <div className="border-t border-[#333] p-6 bg-[#111111]/80">
                                {/* Summary */}
                                {doc.overall_summary && (
                                    <div className="mb-6 bg-racing-accent/5 p-4 rounded-xl border border-racing-accent/20">
                                        <h4 className="text-xs font-bold text-racing-accent uppercase mb-2 tracking-widest">AI Summary</h4>
                                        <p className="text-sm text-slate-300 leading-relaxed font-medium">{doc.overall_summary}</p>
                                    </div>
                                )}

                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
