import { useState } from 'react';
import { ChevronDown, ChevronUp, AlertTriangle, ShieldCheck, Apple } from 'lucide-react';

const InsightCard = ({ metric }) => {
    const [expanded, setExpanded] = useState(false);

    // Safely access nested properties
    const insights = metric.insights || {};
    const causes = insights.possible_causes || [];
    const actions = insights.recommended_actions || [];
    const diet = insights.dietary_suggestions || [];

    const isNormal = metric.status === 'Normal';

    return (
        <div className={`rounded-xl border transition-all duration-300 ${isNormal
            ? 'bg-slate-900/40 border-slate-800'
            : 'bg-slate-900/60 border-slate-700 shadow-lg shadow-blue-900/10'
            }`}>
            <div
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-800/30 transition-colors rounded-xl"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${metric.status === 'Critical' || metric.status === 'High' ? 'bg-red-500/20 text-red-400' :
                        metric.status === 'Low' ? 'bg-amber-500/20 text-amber-400' :
                            'bg-emerald-500/20 text-emerald-400'
                        }`}>
                        <span className="font-bold text-xs">{metric.value}</span>
                    </div>
                    <div>
                        <h4 className="text-white font-medium">{metric.name}</h4>
                        <div className={`text-xs ${metric.status === 'Critical' || metric.status === 'High' ? 'text-red-400' :
                            metric.status === 'Low' ? 'text-amber-400' :
                                'text-emerald-400'
                            }`}>
                            {metric.status.toUpperCase()}
                        </div>
                    </div>
                </div>

                {/* Only show expand icon if there are insights */}
                {!isNormal && (
                    <div className="text-slate-500">
                        {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                )}
            </div>

            {/* Expandable Content (Only for abnormal results) */}
            <div className={`overflow-hidden transition-all duration-300 ${expanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="p-4 pt-0 border-t border-slate-800/50 space-y-4">

                    {/* Causes */}
                    {causes.length > 0 && (
                        <div>
                            <h5 className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase mb-2">
                                <AlertTriangle size={14} className="text-amber-400" /> Possible Causes
                            </h5>
                            <ul className="list-disc list-inside text-sm text-slate-300 space-y-1 pl-1">
                                {causes.map((c, i) => <li key={i}>{c}</li>)}
                            </ul>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Actions */}
                        {actions.length > 0 && (
                            <div className="bg-blue-500/5 rounded-lg p-3 border border-blue-500/10">
                                <h5 className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase mb-2">
                                    <ShieldCheck size={14} /> Recommended
                                </h5>
                                <ul className="text-sm text-slate-300 space-y-1">
                                    {actions.map((a, i) => <li key={i} className="flex gap-2"><span className="text-blue-500">•</span> {a}</li>)}
                                </ul>
                            </div>
                        )}

                        {/* Diet */}
                        {diet.length > 0 && (
                            <div className="bg-emerald-500/5 rounded-lg p-3 border border-emerald-500/10">
                                <h5 className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase mb-2">
                                    <Apple size={14} /> Diet
                                </h5>
                                <ul className="text-sm text-slate-300 space-y-1">
                                    {diet.map((d, i) => <li key={i} className="flex gap-2"><span className="text-emerald-500">•</span> {d}</li>)}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InsightCard;
