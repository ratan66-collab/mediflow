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
            ? 'bg-[#1a1a1a] border-[#2a2a2a]'
            : 'bg-[#1a1a1a] border-[#2a2a2a] hover:border-[#444]'
            }`}>
            <div
                className="p-4 flex items-center justify-between cursor-pointer rounded-xl"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-center gap-5">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${metric.status === 'Critical' || metric.status === 'High' ? 'bg-[#ff4b2233] text-[#ff4b22]' :
                        metric.status === 'Low' ? 'bg-[#f59e0b33] text-[#f59e0b]' :
                            'bg-[#10b98133] text-[#10b981]' /* Emerald for Normal */
                        }`}>
                        <span className="font-bold text-sm tracking-widest">{metric.value}</span>
                    </div>
                    <div className="flex flex-col">
                        <h4 className="text-white text-[17px] font-medium tracking-wide">{metric.name}</h4>
                        <div className={`text-[11px] font-bold tracking-widest mt-0.5 uppercase ${metric.status === 'Critical' || metric.status === 'High' ? 'text-[#ff4b22]' :
                            metric.status === 'Low' ? 'text-[#f59e0b]' :
                                'text-[#10b981]'
                            }`}>
                            {metric.status}
                        </div>
                    </div>
                </div>

                {/* Only show expand icon if there are insights */}
                {!isNormal && (
                    <div className="text-gray-500 pr-2">
                        {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                )}
            </div>

            {/* Expandable Content (Only for abnormal results) */}
            <div className={`overflow-hidden transition-all duration-300 ${expanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="p-4 pt-0 border-t border-[#2a2a2a] space-y-4">

                    {/* Causes */}
                    {causes.length > 0 && (
                        <div className="mt-4">
                            <h5 className="flex items-center gap-2 text-xs font-display tracking-widest text-racing-accent uppercase mb-2">
                                <AlertTriangle size={14} /> Possible Causes
                            </h5>
                            <ul className="list-disc list-inside text-sm text-gray-300 space-y-1 pl-1 font-sans">
                                {causes.map((c, i) => <li key={i}>{c}</li>)}
                            </ul>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Actions */}
                        {actions.length > 0 && (
                            <div className="bg-[#222222] rounded-xl p-4 border border-[#333333]">
                                <h5 className="flex items-center gap-2 text-xs font-display tracking-widest text-[#4ade80] uppercase mb-3">
                                    <ShieldCheck size={14} /> Recommended Action
                                </h5>
                                <ul className="text-sm text-gray-300 space-y-2 font-sans">
                                    {actions.map((a, i) => <li key={i} className="flex gap-2"><span className="text-[#4ade80] font-bold">•</span> {a}</li>)}
                                </ul>
                            </div>
                        )}

                        {/* Diet */}
                        {diet.length > 0 && (
                            <div className="bg-[#222222] rounded-xl p-4 border border-[#333333]">
                                <h5 className="flex items-center gap-2 text-xs font-display tracking-widest text-[#f59e0b] uppercase mb-3">
                                    <Apple size={14} /> Dietary Changes
                                </h5>
                                <ul className="text-sm text-gray-300 space-y-2 font-sans">
                                    {diet.map((d, i) => <li key={i} className="flex gap-2"><span className="text-[#f59e0b] font-bold">•</span> {d}</li>)}
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
