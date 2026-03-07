import { motion } from 'framer-motion';

const RiskGauge = ({ score }) => {
    const radius = 60;
    const strokeWidth = 12;
    const normalizedRadius = radius - strokeWidth * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    let color = "text-green-500";
    if (score > 60) color = "text-red-500";
    else if (score > 30) color = "text-orange-500";

    return (
        <div className="relative flex items-center justify-center">
            <svg
                height={radius * 2}
                width={radius * 2}
                className="transform -rotate-90"
            >
                {/* Background Circle */}
                <circle
                    stroke="lightgray"
                    fill="transparent"
                    strokeWidth={strokeWidth}
                    className="opacity-20"
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                />
                {/* Animated Progress Circle */}
                <motion.circle
                    stroke="currentColor"
                    fill="transparent"
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference + ' ' + circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className={color}
                    strokeLinecap="round"
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                />
            </svg>
            {/* Score Text */}
            <div className="absolute flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-slate-800">{score}%</span>
                <span className="text-xs text-slate-500 uppercase tracking-wider">Risk</span>
            </div>
        </div>
    );
};

export default RiskGauge;
