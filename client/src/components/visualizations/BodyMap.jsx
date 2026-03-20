import React, { useMemo } from 'react';

const BodyMap = ({ affectedOrgans = [] }) => {
    // Normalize input
    const violations = useMemo(() => affectedOrgans.map(o => o.toLowerCase()), [affectedOrgans]);

    const check = (keywords) => {
        return keywords.some(k => violations.some(v => v.includes(k)));
    };

    // Medical Illustration Style Organs
    const organs = [
        {
            id: 'thyroid',
            label: 'Thyroid',
            keywords: ['thyroid', 'throat', 'neck', 'hormone', 'tsh'],
            path: 'M95 50 Q100 55 105 50 Q105 55 108 52 Q110 50 105 45 Q100 48 95 45 Q90 50 92 52 Q95 55 95 50', // Butterfly shape
            color: '#f472b6', // Pink
            cx: 100, cy: 50,
            side: 'right'
        },
        {
            id: 'trachea',
            label: 'Trachea',
            keywords: ['trachea', 'windpipe', 'throat'],
            path: 'M98 52 L98 80 L102 80 L102 52 Z', // Tube
            color: '#e2e8f0', // White/Grey
            cx: 100, cy: 65,
            side: 'left'
        },
        {
            id: 'lungs',
            label: 'Lungs',
            keywords: ['lung', 'respiratory', 'breath', 'chest', 'pneumonia'],
            path: 'M85 85 Q70 90 70 120 Q70 145 90 145 Q98 140 98 120 Z M115 85 Q130 90 130 120 Q130 145 110 145 Q102 140 102 120 Z',
            color: '#ef4444', // Reddish
            cx: 100, cy: 110,
            side: 'right'
        },
        {
            id: 'heart',
            label: 'Heart',
            keywords: ['heart', 'cardiac', 'pulse', 'bp', 'pressure'],
            path: 'M100 115 A 10 10 0 0 1 110 125 L 100 140 L 90 125 A 10 10 0 0 1 100 115',
            color: '#b91c1c', // Deep Red
            cx: 100, cy: 125,
            side: 'right'
        },
        {
            id: 'liver',
            label: 'Liver',
            keywords: ['liver', 'hepatic', 'sgpt', 'sgot'],
            path: 'M85 150 Q75 150 75 165 Q75 180 100 175 Q125 180 125 160 Q125 150 85 150',
            color: '#b45309', // Brown
            cx: 90, cy: 160,
            side: 'left'
        },
        {
            id: 'stomach',
            label: 'Stomach',
            keywords: ['stomach', 'gut', 'gastric'],
            path: 'M105 160 Q125 160 120 180 Q115 190 100 185 Q95 175 105 160',
            color: '#d97706', // Orange-ish Brown
            cx: 115, cy: 170,
            side: 'right'
        },
        {
            id: 'pancreas',
            label: 'Pancreas',
            keywords: ['pancreas', 'insulin', 'diabetes', 'sugar'],
            path: 'M100 180 Q110 185 125 180 Q115 190 100 185',
            color: '#fcd34d', // Yellowish
            cx: 120, cy: 182,
            side: 'right'
        },
        {
            id: 'kidneys',
            label: 'Kidney',
            keywords: ['kidney', 'renal', 'creatinine'],
            path: 'M80 185 Q75 195 80 205 Q85 195 80 185 M120 185 Q125 195 120 205 Q115 195 120 185',
            color: '#713f12', // Dark Brown
            cx: 80, cy: 195,
            side: 'left'
        },
        {
            id: 'large_intestine',
            label: 'Large Intestine',
            keywords: ['colon', 'bowel', 'intestine'],

            // More organic path
            path: 'M75 210 Q75 200 100 200 Q125 200 125 210 V250 Q125 260 100 260 Q75 260 75 250 Z',
            color: '#fca5a5', // Light Pink
            cx: 75, cy: 230,
            side: 'left'
        },
        {
            id: 'small_intestine',
            label: 'Small Intestine',
            keywords: ['intestine', 'gut'],
            path: 'M85 215 Q100 210 115 215 Q120 230 115 245 Q100 250 85 245 Q80 230 85 215',
            color: '#f87171', // Pink/Red
            cx: 125, cy: 230,
            side: 'right'
        },
        {
            id: 'bladder',
            label: 'Bladder',
            keywords: ['bladder', 'urine', 'urinary'],
            path: 'M90 270 Q100 285 110 270 Q100 265 90 270',
            color: '#a855f7', // Purple/Pink
            cx: 100, cy: 275,
            side: 'right'
        }
    ];

    return (
        <div className="w-full h-full flex items-center justify-center bg-white rounded-xl relative p-4 overflow-hidden">
            <svg viewBox="0 0 400 600" className="h-full w-auto max-w-full" xmlns="http://www.w3.org/2000/svg">

                {/* Silhouette - Blue like reference */}
                <path
                    d="M200 20 C160 20 140 60 130 80 C110 110 110 200 110 250 C110 350 100 450 140 580 H260 C300 450 290 350 290 250 C290 200 290 110 270 80 C260 60 240 20 200 20"
                    fill="#60a5fa"
                    opacity="0.8"
                />

                {/* Organs Group */}
                <g transform="translate(100, 20) scale(1.0)">
                    {organs.map((organ) => {
                        const active = check(organ.keywords);
                        // If active, scale up slightly or glow. If not, standard color.

                        return (
                            <g key={organ.id}>
                                <path
                                    d={organ.path}
                                    fill={organ.color}
                                    stroke="#7f1d1d"
                                    strokeWidth="0.5"
                                    className={`transition-all duration-300 ${active ? 'animate-pulse drop-shadow-xl' : ''}`}
                                />

                                {/* Labels (Always show names like in reference, highlight if active) */}
                                <line
                                    x1={organ.cx} y1={organ.cy}
                                    x2={organ.side === 'left' ? '-10' : '210'}
                                    y2={organ.cy}
                                    stroke="#475569"
                                    strokeWidth="1"
                                />
                                <text
                                    x={organ.side === 'left' ? '-15' : '215'}
                                    y={organ.cy + 4}
                                    textAnchor={organ.side === 'left' ? 'end' : 'start'}
                                    className={`text-[12px] font-sans ${active ? 'fill-red-600 font-bold text-sm' : 'fill-slate-600'}`}
                                >
                                    {organ.label}
                                </text>
                            </g>
                        )
                    })}
                </g>
            </svg>
        </div>
    );
};

export default BodyMap;
