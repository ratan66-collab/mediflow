import React from 'react';
import { Activity, Droplet, Search, ShieldAlert, Heart, Info } from 'lucide-react';

const METRIC_DEFINITIONS = [
    { title: "Thyroid Function", keywords: ['thyroid', 'tsh', 'hormone'], defaultVal: 0, unit: 'µIU/ml', side: 'left' },
    { title: "Cholesterol Total", keywords: ['cholesterol', 'lipid', 'ldl', 'hdl'], defaultVal: 0, unit: 'mg/dl', side: 'left' },
    { title: "Kidney Function", keywords: ['kidney', 'creatinine', 'renal', 'gfr'], defaultVal: 0, unit: 'mg/dl', side: 'left' },
    { title: "Vitamin D", keywords: ['vitamin d', 'vit d', 'calcifediol'], defaultVal: 0, unit: 'ng/ml', side: 'left' },
    { title: "HbA1c", keywords: ['hba1c', 'sugar', 'glucose'], defaultVal: 0, unit: '%', side: 'left' },
    { title: "Vitamin B12", keywords: ['vitamin b12', 'vit b12', 'b12', 'cobalamin'], defaultVal: 0, unit: 'pg/ml', side: 'right' },
    { title: "Liver Function", keywords: ['liver', 'sgpt', 'alt', 'ast', 'bilirubin'], defaultVal: 0, unit: 'U/L', side: 'right' },
    { title: "Calcium Total", keywords: ['calcium', 'ca'], defaultVal: 0, unit: 'mg/dl', side: 'right' },
    { title: "Iron studies", keywords: ['iron', 'ferritin', 'transferrin'], defaultVal: 0, unit: 'µg/dl', side: 'right' },
    { title: "Complete Hemogram", keywords: ['hemogram', 'haemoglobin', 'hb', 'rbc', 'wbc'], defaultVal: 0, unit: 'g/dL', side: 'right' },
];

export default function DigitalBodyMap({ result }) {
    // Safe evaluation of metric
    const evaluateMetric = (def) => {
        if (result && result.metrics) {
            const found = result.metrics.find(m => def.keywords.some(k => (m?.name || '').toLowerCase().includes(k)));
            if (found) {
                return { value: found.value, unit: found.unit || def.unit, status: found.status || 'Normal' };
            }
        }
        return { value: def.defaultVal, unit: def.unit, status: '-' };
    };

    const leftItems = METRIC_DEFINITIONS.filter(m => m.side === 'left');
    const rightItems = METRIC_DEFINITIONS.filter(m => m.side === 'right');

    const MetricRow = ({ item, align }) => {
        const data = evaluateMetric(item);
        const isBlank = data.status === '-';
        const isNormal = data.status === 'Normal';

        return (
            <div className={`flex flex-col ${align === 'right' ? 'items-start' : 'items-end md:items-start'} gap-1 p-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl hover:border-[#ccff00]/50 transition-colors`}>
                <div className="flex items-center gap-3 w-full">
                    <div className="w-10 h-10 rounded-full bg-[#ccff00]/10 flex items-center justify-center flex-shrink-0">
                        <Activity className="text-[#ccff00] w-5 h-5" />
                    </div>
                    <div className="flex-1">
                        <h4 className="text-white text-sm font-bold tracking-wide">{item.title}</h4>
                        <div className="flex items-baseline gap-1 mt-1">
                            <span className="text-xl font-bold text-gray-200">{data.value}</span>
                            <span className="text-gray-500 text-xs">{data.unit}</span>
                        </div>
                        <div className="mt-1">
                            <span className={`text-[10px] uppercase font-bold tracking-wider ${
                                isBlank ? 'text-gray-600' : isNormal ? 'text-[#ccff00]' : 'text-red-500'
                            }`}>
                                {isBlank ? 'Awaiting Data' : isNormal ? '• Everything looks good' : '• Attention Needed'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="w-full bg-[#111111] border border-[#2a2a2a] rounded-3xl p-6 lg:p-10 mb-8 relative overflow-hidden">
            <h3 className="text-2xl font-bold text-white uppercase tracking-wider text-center mb-8">
                Vital Health Parameters
            </h3>

            <div className="flex flex-col lg:flex-row items-center justify-center gap-8 w-full">
                
                {/* Left Metrics */}
                <div className="w-full lg:w-1/4 flex flex-col gap-4 z-10">
                    {leftItems.map((item, idx) => <MetricRow key={idx} item={item} align="left" />)}
                </div>

                {/* Central Body SVG */}
                <div className="w-full lg:w-2/4 flex justify-center py-4 relative z-0">
                    {/* Glowing background aura */}
                    <div className="absolute inset-0 bg-[#ccff00]/5 blur-[100px] rounded-full"></div>
                    
                    <svg viewBox="0 0 400 600" className="w-[80%] max-w-[300px] h-auto filter drop-shadow-[0_0_15px_rgba(204,255,0,0.3)]">
                        {/* Anatomical Grid/Wireframe Lines */}
                        <defs>
                            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#ccff00" strokeWidth="0.5" strokeOpacity="0.2"/>
                            </pattern>
                            <linearGradient id="bodyGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#ccff00" stopOpacity="0.1" />
                                <stop offset="100%" stopColor="#ccff00" stopOpacity="0.02" />
                            </linearGradient>
                        </defs>

                        {/* Silhouette Body Path */}
                        <path
                            d="M200 30 
                               C180 30 170 45 170 65 
                               C170 80 180 90 190 95 
                               C160 100 130 110 110 150 
                               C90 190 90 250 80 300 
                               C70 350 50 370 50 400 
                               C50 420 60 430 70 430
                               C80 430 90 410 90 380
                               C90 350 110 300 120 250
                               C125 220 130 200 135 250
                               C140 300 130 400 135 480
                               C140 550 130 580 130 590
                               C130 595 150 595 160 590
                               C170 580 160 500 160 450
                               C160 400 180 380 200 380
                               C220 380 240 400 240 450
                               C240 500 230 580 240 590
                               C250 595 270 595 270 590
                               C270 580 260 550 265 480
                               C270 400 260 300 265 250
                               C270 200 275 220 280 250
                               C290 300 310 350 310 380
                               C310 410 320 430 330 430
                               C340 430 350 420 350 400
                               C350 370 330 350 320 300
                               C310 250 310 190 290 150
                               C270 110 240 100 210 95
                               C220 90 230 80 230 65
                               C230 45 220 30 200 30 Z"
                            fill="url(#bodyGrad)"
                            stroke="#ccff00"
                            strokeWidth="1.5"
                            strokeOpacity="0.8"
                        />
                        
                        {/* Overlay Pattern */}
                        <path
                            d="M200 30 C180 30 170 45 170 65 C170 80 180 90 190 95 C160 100 130 110 110 150 C90 190 90 250 80 300 C70 350 50 370 50 400 C50 420 60 430 70 430 C80 430 90 410 90 380 C90 350 110 300 120 250 C125 220 130 200 135 250 C140 300 130 400 135 480 C140 550 130 580 130 590 C130 595 150 595 160 590 C170 580 160 500 160 450 C160 400 180 380 200 380 C220 380 240 400 240 450 C240 500 230 580 240 590 C250 595 270 595 270 590 C270 580 260 550 265 480 C270 400 260 300 265 250 C270 200 275 220 280 250 C290 300 310 350 310 380 C310 410 320 430 330 430 C340 430 350 420 350 400 C350 370 330 350 320 300 C310 250 310 190 290 150 C270 110 240 100 210 95 C220 90 230 80 230 65 C230 45 220 30 200 30 Z"
                            fill="url(#grid)"
                        />

                        {/* Node Dots to make it look "techy" */}
                        <circle cx="200" cy="55" r="3" fill="#ffffff" />
                        <circle cx="200" cy="115" r="3" fill="#ffffff" />
                        <circle cx="160" cy="160" r="3" fill="#ffffff" />
                        <circle cx="240" cy="160" r="3" fill="#ffffff" />
                        <circle cx="150" cy="240" r="3" fill="#ffffff" />
                        <circle cx="250" cy="240" r="3" fill="#ffffff" />
                        <circle cx="200" cy="230" r="4" fill="#ccff00" className="animate-pulse" />
                        <circle cx="200" cy="300" r="3" fill="#ffffff" />
                        <circle cx="150" cy="350" r="3" fill="#ffffff" />
                        <circle cx="250" cy="350" r="3" fill="#ffffff" />
                        
                        {/* Connecting Lines between nodes */}
                        <line x1="200" y1="55" x2="200" y2="115" stroke="#ccff00" strokeWidth="1" strokeOpacity="0.5"/>
                        <line x1="200" y1="115" x2="160" y2="160" stroke="#ccff00" strokeWidth="1" strokeOpacity="0.5"/>
                        <line x1="200" y1="115" x2="240" y2="160" stroke="#ccff00" strokeWidth="1" strokeOpacity="0.5"/>
                        <line x1="160" y1="160" x2="150" y2="240" stroke="#ccff00" strokeWidth="1" strokeOpacity="0.5"/>
                        <line x1="240" y1="160" x2="250" y2="240" stroke="#ccff00" strokeWidth="1" strokeOpacity="0.5"/>
                        <line x1="160" y1="160" x2="200" y2="230" stroke="#ccff00" strokeWidth="1" strokeOpacity="0.5"/>
                        <line x1="240" y1="160" x2="200" y2="230" stroke="#ccff00" strokeWidth="1" strokeOpacity="0.5"/>
                        <line x1="200" y1="230" x2="200" y2="300" stroke="#ccff00" strokeWidth="1" strokeOpacity="0.5"/>
                        <line x1="200" y1="300" x2="150" y2="350" stroke="#ccff00" strokeWidth="1" strokeOpacity="0.5"/>
                        <line x1="200" y1="300" x2="250" y2="350" stroke="#ccff00" strokeWidth="1" strokeOpacity="0.5"/>

                    </svg>
                </div>

                {/* Right Metrics */}
                <div className="w-full lg:w-1/4 flex flex-col gap-4 z-10">
                    {rightItems.map((item, idx) => <MetricRow key={idx} item={item} align="right" />)}
                </div>
            </div>
        </div>
    );
}
