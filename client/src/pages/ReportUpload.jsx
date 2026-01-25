import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, AlertCircle, CheckCircle, Loader2, Calendar, ChevronRight, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

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
                const key = `user_documents_${user.email}`;
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

            const formData = new FormData();
            formData.append('file', currentFile);

            try {
                const response = await fetch('http://127.0.0.1:8000/api/reports/analyze', {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) {
                    const errData = await response.json();
                    throw new Error(errData.detail || `Failed to analyze ${currentFile.name}`);
                }

                const data = await response.json();

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
                console.error(err);
                setError(`Error on ${currentFile.name}: ${err.message}`);
                // Continue to next file even if one fails? 
                // Let's decide to continue best effort
            }
        }

        // Update Local State with all new docs
        const updatedDocs = [...newDocs, ...documents];
        setDocuments(updatedDocs);

        // Final Sync for Fallback
        if (user?.email && !supabase) {
            localStorage.setItem(`user_documents_${user.email}`, JSON.stringify(updatedDocs));
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
        localStorage.setItem(`dashboard_analysis_${user.email}`, JSON.stringify(doc));
        // Redirect to dashboard
        navigate('/');
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-white mb-2">Your Documents</h2>
                    <p className="text-slate-400">Secure repository of your medical history.</p>
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
                        className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold cursor-pointer transition-colors shadow-lg shadow-blue-500/20"
                    >
                        <Upload size={18} />
                        {queue.length > 0 ? "Add More" : "Upload New"}
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
                <div className="bg-slate-900/80 border border-blue-500/30 p-6 rounded-xl space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                        <div className="flex items-center gap-3">
                            <FileText className="text-blue-400" />
                            <span className="text-slate-200">Selected <span className="font-bold text-white">{queue.length} files</span></span>
                        </div>
                        <button
                            onClick={() => setQueue([])}
                            className="text-xs text-red-400 hover:text-red-300"
                        >
                            Clear All
                        </button>
                    </div>

                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                        {queue.map((f, i) => (
                            <div key={i} className="text-sm text-slate-400 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                                {f.name}
                            </div>
                        ))}
                    </div>

                    <div className="pt-2">
                        <button
                            onClick={handleBatchAnalyze}
                            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold shadow-lg shadow-blue-500/20 transition-all"
                        >
                            Save & Analyze All
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
                    <div key={doc.id} className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden transition-all hover:border-slate-700">
                        {/* Card Header */}
                        <div
                            onClick={() => toggleExpand(doc)}
                            className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-800/30"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-400 font-bold">
                                    {doc.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-lg">{doc.name}</h3>
                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                        <Calendar size={12} /> {doc.date} &bull; {doc.metrics?.length || 0} Metrics
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleLoadToDashboard(doc);
                                    }}
                                    className="text-xs bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 px-3 py-1.5 rounded-lg border border-blue-500/30 font-medium transition-colors"
                                >
                                    View on Dashboard
                                </button>
                                <div className="text-slate-500">
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
                                            <span className={`text-[10px] px-2 py-1 rounded border ${m.status === 'Normal' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                'bg-red-500/10 text-red-400 border-red-500/20'
                                                }`}>
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
