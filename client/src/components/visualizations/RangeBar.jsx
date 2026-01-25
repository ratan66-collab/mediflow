import React from 'react';

const RangeBar = ({ value, min = 0, max = 200, unit, status }) => {
    // Normalize value to percentage
    const percentage = Math.min(Math.max(((value - min) / (max - min)) * 100, 0), 100);

    // Determine color based on status
    const getColor = () => {
        if (status === 'Normal') return 'bg-emerald-500';
        if (status === 'Low') return 'bg-amber-500';
        return 'bg-red-500';
    };

    return (
        <div className="w-full">
            <div className="flex justify-between text-xs text-slate-400 mb-2">
                <span>Low</span>
                <span>Normal</span>
                <span>High</span>
            </div>
            <div className="relative h-4 bg-slate-800 rounded-full overflow-hidden">
                {/* Background Zones */}
                <div className="absolute inset-0 flex opacity-20">
                    <div className="w-[30%] bg-amber-500 h-full"></div>
                    <div className="w-[40%] bg-emerald-500 h-full"></div>
                    <div className="w-[30%] bg-red-500 h-full"></div>
                </div>

                {/* User Value Dot */}
                <div
                    className={`absolute top-0 bottom-0 w-2 ${getColor()} rounded-full shadow-lg shadow-white/20 transition-all duration-1000 ease-out`}
                    style={{ left: `${percentage}%`, transform: 'translateX(-50%)' }}
                >
                    <div className={`absolute top-0 bottom-0 w-full animate-ping ${getColor()} rounded-full opacity-75`}></div>
                </div>
            </div>
            <div className="mt-1 text-center">
                <span className={`text-sm font-bold ${status === 'Normal' ? 'text-emerald-400' : status === 'Low' ? 'text-amber-400' : 'text-red-400'}`}>
                    {value} {unit}
                </span>
            </div>
        </div>
    );
};

export default RangeBar;
