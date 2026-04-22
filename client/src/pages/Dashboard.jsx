import { useState, useEffect } from 'react';
import { Upload, Heart, Activity, Thermometer, Droplet, TrendingUp, Loader2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import DigitalBodyMap from '../components/visualizations/DigitalBodyMap';
import { useAuth } from '../contexts/AuthContext';
import { endpoints } from '../config';

const emptyChartData = [
    { month: 'Jan', value: 0 },
    { month: 'Feb', value: 0 },
    { month: 'Mar', value: 0 },
    { month: 'Apr', value: 0 },
    { month: 'May', value: 0 },
    { month: 'Jun', value: 0 },
];

export default function Dashboard() {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();
    const [result, setResult] = useState(null);

    useEffect(() => {
        if (user?.email) {
            const saved = localStorage.getItem(`dashboard_analysis_${user.email}`);
            if (saved) {
                setResult(JSON.parse(saved));
            }
        }
    }, [user?.email]);

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (selected) {
            setFile(selected);
        }
    };

    const handleAnalyze = async () => {
        if (!file) return;
        setLoading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch(endpoints.analyze, {
                method: 'POST',
                body: formData,
            });
            if (response.ok) {
                const data = await response.json();
                setResult(data);
                if (user?.email) {
                    localStorage.setItem(`dashboard_analysis_${user.email}`, JSON.stringify(data));
                    window.dispatchEvent(new Event('analysisUpdated'));
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
            setFile(null); // clear file after upload
        }
    };

    const handleClearData = () => {
        setResult(null);
        setFile(null);
        if (user?.email) {
            localStorage.removeItem(`dashboard_analysis_${user.email}`);
            window.dispatchEvent(new Event('analysisUpdated'));
        }
    };

    // Helper to safely get metric info from dynamic result or fallback to defaults
    const getMetric = (keywords, defaultUnit) => {
        if (result?.metrics) {
            const found = result.metrics.find(m => keywords.some(k => (m?.name || '').toLowerCase().includes(k)));
            if (found) return { value: found.value, unit: found.unit, status: found.status };
        }
        return { value: 0, unit: defaultUnit, status: '-' };
    };

    const hr = getMetric(['heart', 'pulse'], 'bpm');
    const bp = getMetric(['pressure', 'blood pressure'], 'mmHg');
    const temp = getMetric(['temperature', 'temp'], '°F');
    const sugar = getMetric(['sugar', 'glucose'], 'mg/dL');

    const activeChartData = result ? [
        { month: 'Jan', value: 95 },
        { month: 'Feb', value: 105 },
        { month: 'Mar', value: 102 },
        { month: 'Apr', value: 92 },
        { month: 'May', value: 89 },
        { month: 'Jun', value: 87 }, // Dummy data mimicking a trend when a report is loaded
    ] : emptyChartData;

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-12">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8 mt-2">
                <div>
                    <h2 className="text-3xl font-bold text-white uppercase tracking-wider m-0">Health Overview</h2>
                    <p className="text-gray-400 mt-1">Your latest health insights at a glance</p>
                </div>
                <div className="flex items-center gap-3">
                    <input
                        type="file"
                        id="dash-upload"
                        onChange={handleFileChange}
                        accept=".pdf,image/*"
                        className="hidden"
                    />
                    {!file && (
                        <>
                            {result && (
                                <button
                                    onClick={handleClearData}
                                    className="bg-[#222222] hover:bg-[#333333] text-gray-300 font-semibold px-6 py-2.5 rounded-lg transition-colors border border-[#444444]"
                                >
                                    Clear Data
                                </button>
                            )}
                            <label
                                htmlFor="dash-upload"
                                className="bg-[#ccff00] hover:bg-[#b8e600] text-black font-semibold px-6 py-2.5 rounded-lg cursor-pointer transition-colors flex items-center gap-2"
                            >
                                <Upload size={18} />
                                Upload PDF
                            </label>
                        </>
                    )}
                    {file && (
                        <button
                            onClick={handleAnalyze}
                            disabled={loading}
                            className="bg-white hover:bg-gray-100 text-black font-semibold px-6 py-2.5 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-70"
                        >
                            {loading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                            {loading ? 'Analyzing...' : 'Analyze Now'}
                        </button>
                    )}
                </div>
            </div>

            {/* Vitals Top Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <VitalCard title="HEART RATE" icon={<Heart size={18} className="text-[#ccff00]" />} value={hr.value} unit={hr.unit} status={hr.status} />
                <VitalCard title="BLOOD PRESSURE" icon={<Activity size={18} className="text-[#ccff00]" />} value={bp.value} unit={bp.unit} status={bp.status} />
                <VitalCard title="TEMPERATURE" icon={<Thermometer size={18} className="text-[#ccff00]" />} value={temp.value} unit={temp.unit} status={temp.status} />
                <VitalCard title="BLOOD SUGAR" icon={<Droplet size={18} className="text-[#ccff00]" />} value={sugar.value} unit={sugar.unit} status={sugar.status} />
            </div>

            <DigitalBodyMap result={result} />

            {/* Main Area: AI Assessment */}
            <div className="grid grid-cols-1 gap-6">
                {/* AI Assessment Column */}
                <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-6 flex flex-col md:flex-row gap-6">
                    <div className="flex-1 flex flex-col gap-4">
                        <h3 className="text-white font-bold tracking-wider uppercase text-sm mb-2">AI Assessment</h3>
                        
                        {/* User Summary Block */}
                        <div className="bg-[#ccff00]/10 border border-[#ccff00]/20 rounded-xl p-6">
                            <h4 className="text-[#ccff00] font-semibold text-lg mb-2">User Summary</h4>
                            <p className="text-gray-300 text-sm leading-relaxed">
                                {result?.overall_summary ? result.overall_summary : 'Please upload a report to generate insights.'}
                            </p>
                        </div>
                    </div>

                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Symptoms Block */}
                        <div className="bg-[#222222] rounded-xl p-6 shadow-lg">
                            <h4 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                                <Activity size={18} className="text-[#ccff00]" />
                                Symptoms & Findings
                            </h4>
                            <ul className="text-gray-300 text-sm space-y-4">
                                {result?.symptoms?.length > 0 ? (
                                    result.symptoms.map((s, i) => (
                                        <li key={i} className="flex gap-3 items-start">
                                            <span className="text-[#ccff00] mt-1 shrink-0">•</span> 
                                            <span className="leading-relaxed">{s}</span>
                                        </li>
                                    ))
                                ) : result?.critical_findings?.length > 0 ? (
                                    result.critical_findings.map((f, i) => (
                                        <li key={i} className="flex gap-3 items-start">
                                            <span className="text-[#ccff00] mt-1 shrink-0">•</span> 
                                            <span className="leading-relaxed">{f}</span>
                                        </li>
                                    ))
                                ) : (
                                    <li className="flex gap-3 items-start italic text-gray-500">
                                        No data extracted yet.
                                    </li>
                                )}
                            </ul>
                        </div>

                        {/* Precautions Block */}
                        <div className="bg-[#222222] rounded-xl p-6 shadow-lg">
                            <h4 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                                <Droplet size={18} className="text-[#ccff00]" />
                                Recommended Precautions
                            </h4>
                            <ul className="text-gray-300 text-sm space-y-4">
                                {result?.precautions?.length > 0 ? (
                                    result.precautions.map((p, i) => (
                                        <li key={i} className="flex gap-3 items-start">
                                            <span className="text-[#ccff00] mt-1 shrink-0">•</span> 
                                            <span className="leading-relaxed">{p}</span>
                                        </li>
                                    ))
                                ) : result?.metrics?.length > 0 ? (
                                    result.metrics.flatMap(m => m.insights?.recommended_actions || []).slice(0, 5).map((a, i) => (
                                        <li key={i} className="flex gap-3 items-start">
                                            <span className="text-[#ccff00] mt-1 shrink-0">•</span> 
                                            <span className="leading-relaxed">{a}</span>
                                        </li>
                                    ))
                                ) : (
                                    <li className="flex gap-3 items-start italic text-gray-500">
                                        No data extracted yet.
                                    </li>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function VitalCard({ title, icon, value, unit, status }) {
    const isNormal = status === 'Normal';
    const isBlank = status === '-';
    
    return (
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-5 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
                <span className="text-gray-400 text-xs font-semibold tracking-wider uppercase">{title}</span>
                {icon}
            </div>
            <div>
                <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-white">{value}</span>
                    <span className="text-gray-400 text-sm font-medium">{unit}</span>
                </div>
                <div className="mt-3">
                    <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded ${
                        isBlank
                        ? 'bg-gray-800/50 text-gray-500'
                        : isNormal 
                        ? 'bg-[#ccff00]/10 text-[#ccff00]' 
                        : 'bg-red-500/10 text-red-500'
                    }`}>
                        {status}
                    </span>
                </div>
            </div>
        </div>
    );
}

