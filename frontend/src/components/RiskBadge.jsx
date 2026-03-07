import { motion } from 'framer-motion';

const RiskBadge = ({ level, animate = true }) => {
    let bgColor = "bg-green-100 text-green-700 border-green-200";
    let dotColor = "bg-green-500";

    if (level === "High") {
        bgColor = "bg-red-100 text-red-700 border-red-200";
        dotColor = "bg-red-500";
    } else if (level === "Medium") {
        bgColor = "bg-orange-100 text-orange-700 border-orange-200";
        dotColor = "bg-orange-500";
    }

    return (
        <div className={`inline-flex items-center px-3 py-1 rounded-full border text-sm font-medium ${bgColor}`}>
            <motion.div
                className={`w-2 h-2 rounded-full mr-2 ${dotColor}`}
                animate={animate && level === "High" ? { scale: [1, 1.5, 1], opacity: [1, 0.5, 1] } : {}}
                transition={{ duration: 1.5, repeat: Infinity }}
            />
            {level} Risk
        </div>
    );
};

export default RiskBadge;
