import { motion } from 'framer-motion';

const Card = ({ children, className = "", hover = false, onClick }) => {
    return (
        <motion.div
            whileHover={hover ? { y: -5, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)" } : {}}
            onClick={onClick}
            className={`bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-slate-100 p-6 ${onClick ? 'cursor-pointer' : ''} ${className}`}
        >
            {children}
        </motion.div>
    );
};

export default Card;
