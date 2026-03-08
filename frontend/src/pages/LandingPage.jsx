import { useEffect, useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    BookOpen, GraduationCap, TrendingUp, MessageSquare,
    Map, ShieldCheck, ArrowRight, Users, BarChart2, Bell,
    AlertCircle, CheckCircle2, Zap, Loader
} from 'lucide-react';
import { useAuth } from '../AuthContext';

/* ─── Animated Counter ──────────────────────────────────────────── */
const AnimatedCounter = ({ target, suffix = '', prefix = '', duration = 2 }) => {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: '0px 0px -40px 0px' });

    useEffect(() => {
        if (!inView) return;
        const numericTarget = parseInt(target.toString().replace(/\D/g, ''), 10);
        let start = 0;
        const step = numericTarget / (duration * 60);
        const timer = setInterval(() => {
            start += step;
            if (start >= numericTarget) {
                setCount(numericTarget);
                clearInterval(timer);
            } else {
                setCount(Math.floor(start));
            }
        }, 1000 / 60);
        return () => clearInterval(timer);
    }, [inView, target, duration]);

    const display = typeof target === 'string' && target.includes(',')
        ? count.toLocaleString()
        : count.toLocaleString();

    return (
        <span ref={ref}>
            {prefix}{display}{suffix}
        </span>
    );
};

/* ─── Live Alert Ticker ─────────────────────────────────────────── */
const LIVE_ALERTS = [
    { name: 'Ravi Patel', class: 7, risk: 91, msg: 'Attendance dropped to 42% this month' },
    { name: 'Sunita Devi', class: 9, risk: 84, msg: 'Exam score declining for 3 months' },
    { name: 'Mohan Das', class: 6, risk: 78, msg: 'Has not attended school in 5 days' },
    { name: 'Priya Sharma', class: 8, risk: 87, msg: 'Financial constraint + low attendance' },
    { name: 'Dinesh Babu', class: 10, risk: 72, msg: 'Sibling dropout history detected' },
];

const LiveAlertTicker = () => {
    const [idx, setIdx] = useState(0);
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const interval = setInterval(() => {
            setVisible(false);
            setTimeout(() => {
                setIdx(i => (i + 1) % LIVE_ALERTS.length);
                setVisible(true);
            }, 400);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    const alert = LIVE_ALERTS[idx];

    return (
        <div className="relative overflow-hidden bg-white/80 backdrop-blur-sm border border-red-100 rounded-2xl px-5 py-4 shadow-lg max-w-sm w-full">
            {/* Pulsing dot */}
            <div className="flex items-center gap-2 mb-2">
                <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
                </span>
                <span className="text-xs font-bold text-red-600 uppercase tracking-wider">Live AI Alert</span>
            </div>

            <AnimatePresence mode="wait">
                {visible && (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="flex items-start gap-3">
                            <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center text-red-700 font-bold text-sm shrink-0">
                                {alert.name.charAt(0)}
                            </div>
                            <div>
                                <p className="font-bold text-slate-800 text-sm">{alert.name}
                                    <span className="ml-2 text-xs font-semibold bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full">{alert.risk}% risk</span>
                                </p>
                                <p className="text-slate-500 text-xs mt-0.5">Class {alert.class} — {alert.msg}</p>
                            </div>
                        </div>
                        <div className="mt-3 bg-green-50 border border-green-200 rounded-xl px-3 py-2 flex items-center gap-2">
                            <MessageSquare size={13} className="text-green-600 shrink-0" />
                            <p className="text-xs text-green-700 font-medium">WhatsApp alert drafted & sent to parent ✓</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

/* ─── Feature Cards ─────────────────────────────────────────────── */
const FEATURES = [
    { icon: BarChart2, title: 'AI Risk Prediction', desc: 'Random Forest model analyses attendance, grades, and socio-economic data to score every student.', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
    { icon: MessageSquare, title: 'WhatsApp Parent Alerts', desc: 'Human-written, warm messages automatically drafted and sent to parents in their language.', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
    { icon: Map, title: 'District Heatmap', desc: 'Visualise risk concentration across all schools in a district for targeted resource allocation.', color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-100' },
    { icon: Users, title: 'Volunteer Coordination', desc: 'Automatically alert community volunteers when a student is absent to trigger a welfare check.', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100' },
    { icon: ShieldCheck, title: 'Intervention Tracker', desc: 'Log home visits, counselling, scholarships and track impact on attendance and performance.', color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100' },
    { icon: GraduationCap, title: 'Scheme Matching', desc: 'Instantly match students to mid-day meal, bicycle, and scholarship government schemes.', color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-100' },
];

/* ─── How It Works Steps ────────────────────────────────────────── */
const STEPS = [
    { step: '01', label: 'Teacher Uploads CSV', icon: BookOpen, desc: 'Attendance & academic data uploaded securely in seconds.' },
    { step: '02', label: 'AI Processes Data', icon: TrendingUp, desc: 'Model scores every student for dropout risk instantly.' },
    { step: '03', label: 'Dashboard Insights', icon: BarChart2, desc: 'Risk levels and class metrics visualised beautifully.' },
    { step: '04', label: 'Parents Notified', icon: Bell, desc: 'WhatsApp messages drafted and sent with one click.' },
];

/* ─── Moving gradient orb ───────────────────────────────────────── */
const Orb = ({ className, animate }) => (
    <motion.div
        className={`absolute rounded-full blur-3xl opacity-20 pointer-events-none ${className}`}
        animate={animate}
        transition={{ duration: 8, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
    />
);

/* ─── Animated Data Flow ───────────────────────────────────────── */
const DataFlowVisualization = () => {
    const dataPoints = [
        { id: 1, color: 'bg-blue-400', delay: 0 },
        { id: 2, color: 'bg-purple-400', delay: 0.3 },
        { id: 3, color: 'bg-pink-400', delay: 0.6 },
        { id: 4, color: 'bg-orange-400', delay: 0.9 },
    ];

    return (
        <div className="relative h-40 flex items-center justify-between px-8 my-12">
            {/* Left: Student Cards */}
            <div className="flex flex-col gap-2">
                {[...Array(3)].map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="w-24 h-8 bg-slate-200 rounded-lg flex items-center justify-center text-xs font-semibold text-slate-600 relative overflow-hidden"
                    >
                        <motion.div
                            animate={{ x: [0, 200, 0] }}
                            transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
                        />
                        Student {i + 1}
                    </motion.div>
                ))}
            </div>

            {/* Center: Processing Animation */}
            <div className="flex flex-col items-center gap-3">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                    className="w-12 h-12 rounded-full border-3 border-primary/20 border-t-primary flex items-center justify-center"
                >
                    <Zap size={20} className="text-primary" />
                </motion.div>
                <p className="text-xs font-semibold text-primary">Processing</p>
            </div>

            {/* Right: Risk Scores */}
            <div className="flex flex-col gap-2">
                {[...Array(3)].map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 + 0.5 }}
                        className="w-24 h-8 rounded-lg flex items-center justify-center text-xs font-bold overflow-hidden relative"
                    >
                        {/* Dynamic background based on risk */}
                        <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${45 + i * 15}%` }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 + 1.2, duration: 0.8 }}
                            className={`absolute inset-0 ${i === 0 ? 'bg-green-100' : i === 1 ? 'bg-yellow-100' : 'bg-red-100'}`}
                        />
                        <span className={`relative ${i === 0 ? 'text-green-700' : i === 1 ? 'text-yellow-700' : 'text-red-700'}`}>
                            {45 + i * 15}% risk
                        </span>
                    </motion.div>
                ))}
            </div>

            {/* Flow arrows */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ filter: 'drop-shadow(0 0 1px rgba(0,0,0,0.1))' }}>
                <defs>
                    <motion.linearGradient
                        id="flowGradient"
                        animate={{ x1: ['0%', '100%'], x2: ['0%', '100%'] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        <stop offset="0%" stopColor="rgba(46,125,50,0)" />
                        <stop offset="50%" stopColor="rgba(46,125,50,0.8)" />
                        <stop offset="100%" stopColor="rgba(46,125,50,0)" />
                    </motion.linearGradient>
                </defs>
                <line x1="30%" y1="50%" x2="40%" y2="50%" stroke="url(#flowGradient)" strokeWidth="2" />
                <line x1="60%" y1="50%" x2="70%" y2="50%" stroke="url(#flowGradient)" strokeWidth="2" />
            </svg>
        </div>
    );
};

/* ─── Animated Risk Gauge ───────────────────────────────────────── */
const AnimatedRiskGauge = ({ risk = 65, students = 127 }) => {
    const circumference = 2 * Math.PI * 45;
    const strokeDashoffset = circumference - (risk / 100) * circumference;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center gap-4"
        >
            <div className="relative w-32 h-32">
                <svg width="140" height="140" className="drop-shadow-lg" style={{ filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.1))' }}>
                    {/* Background circle */}
                    <circle cx="70" cy="70" r="45" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                    
                    {/* Animated progress circle */}
                    <motion.circle
                        cx="70"
                        cy="70"
                        r="45"
                        fill="none"
                        stroke={risk > 70 ? '#ef4444' : risk > 40 ? '#eab308' : '#22c55e'}
                        strokeWidth="8"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        whileInView={{ strokeDashoffset }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.5, ease: 'easeOut' }}
                        strokeLinecap="round"
                        transform="rotate(-90 70 70)"
                    />
                </svg>

                {/* Center content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.8 }}
                        className="text-center"
                    >
                        <motion.span
                            initial={{ scale: 0 }}
                            whileInView={{ scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 1.2, type: 'spring' }}
                            className={`text-2xl font-black ${risk > 70 ? 'text-red-600' : risk > 40 ? 'text-yellow-600' : 'text-green-600'}`}
                        >
                            {risk}%
                        </motion.span>
                        <p className="text-xs text-slate-500 font-semibold mt-0.5">District Avg</p>
                    </motion.div>
                </div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 1.3 }}
                className="text-center"
            >
                <p className="text-sm font-bold text-slate-700">{students} Students At Risk</p>
                <p className="text-xs text-slate-500 mt-1">Across monitored schools</p>
            </motion.div>
        </motion.div>
    );
};

/* ─── Floating Particle Background ───────────────────────────────── */
const FloatingParticles = () => {
    const particles = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        size: Math.random() * 4 + 2,
        delay: Math.random() * 2,
        duration: Math.random() * 8 + 8,
        x: Math.random() * 100,
    }));

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {particles.map(particle => (
                <motion.div
                    key={particle.id}
                    className="absolute rounded-full bg-primary/10"
                    style={{
                        width: particle.size,
                        height: particle.size,
                        left: `${particle.x}%`,
                        top: '-10px',
                    }}
                    animate={{
                        y: window.innerHeight + 10,
                        opacity: [0, 1, 0],
                    }}
                    transition={{
                        duration: particle.duration,
                        ease: 'linear',
                        repeat: Infinity,
                        delay: particle.delay,
                    }}
                />
            ))}
        </div>
    );
};

/* ─── Impact Stats with Animated Bars ───────────────────────────── */
const AnimatedImpactStat = ({ label, value, max, color }) => {
    const percentage = (value / max) * 100;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="space-y-2"
        >
            <div className="flex justify-between items-baseline">
                <span className="text-sm font-semibold text-slate-700">{label}</span>
                <motion.span
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                    className="text-lg font-black text-primary"
                >
                    {value.toLocaleString()}+
                </motion.span>
            </div>
            <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${percentage}%` }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4, duration: 1, ease: 'easeOut' }}
                    className={`h-full rounded-full ${color} shadow-lg`}
                />
            </div>
        </motion.div>
    );
};

/* ─── Success Story Cards ───────────────────────────────────────── */
const SuccessStories = () => {
    const stories = [
        {
            name: 'Ravi Patel',
            school: 'Govt. High School, Tamil Nadu',
            impact: 'Retained after 3 months of low attendance',
            improvement: '72% → 89%',
            icon: CheckCircle2,
        },
        {
            name: 'Sunita Devi',
            school: 'Municipal School, Karnataka',
            impact: 'Enrolled in scholarship program',
            improvement: '45% → 92%',
            icon: CheckCircle2,
        },
        {
            name: 'Mohan Das',
            school: 'Public School, Andhra Pradesh',
            impact: 'Connected with volunteer mentor',
            improvement: '38% → 85%',
            icon: CheckCircle2,
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            {stories.map((story, i) => (
                <motion.div
                    key={story.name}
                    initial={{ opacity: 0, y: 40, rotateX: -10 }}
                    whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.15, duration: 0.6 }}
                    whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                    className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200 relative overflow-hidden"
                >
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.15 + 0.4 }}
                        className="absolute top-0 right-0 p-4"
                    >
                        <CheckCircle2 size={28} className="text-green-500 drop-shadow-lg" />
                    </motion.div>

                    <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: '100%' }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.15 + 0.2, duration: 1 }}
                        className="h-1 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full mb-4"
                    />

                    <h4 className="font-bold text-slate-800 mb-1">{story.name}</h4>
                    <p className="text-xs text-slate-500 mb-3">{story.school}</p>

                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.15 + 0.5 }}
                        className="space-y-2 mb-4"
                    >
                        <p className="text-sm text-slate-700 leading-relaxed">{story.impact}</p>
                        <div className="flex items-center gap-2 text-sm font-semibold">
                            <span className="text-slate-600">Attendance:</span>
                            <span className="text-green-600">{story.improvement}</span>
                        </div>
                    </motion.div>
                </motion.div>
            ))}
        </div>
    );
};

/* ─── Animated Heatmap Preview ───────────────────────────────────── */
const HeatmapPreview = () => {
    const districts = [
        { name: 'Coimbatore', risk: 72, x: 20, y: 20 },
        { name: 'Chennai', risk: 58, x: 45, y: 35 },
        { name: 'Madurai', risk: 81, x: 30, y: 60 },
        { name: 'Salem', risk: 64, x: 60, y: 50 },
        { name: 'Tiruvallur', risk: 48, x: 55, y: 25 },
    ];

    const getRiskColor = (risk) => {
        if (risk > 75) return 'bg-red-500';
        if (risk > 50) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative w-full h-64 bg-gradient-to-br from-slate-100 to-slate-50 rounded-2xl border border-slate-200 overflow-hidden p-4"
        >
            <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                    <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                        <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5" />
                    </pattern>
                </defs>
                <rect width="100" height="100" fill="url(#grid)" />
            </svg>

            {/* Animated risk hotspots */}
            {districts.map((district, i) => (
                <motion.div
                    key={district.name}
                    className="absolute flex flex-col items-center"
                    style={{ left: `${district.x}%`, top: `${district.y}%` }}
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 + 0.3 }}
                >
                    {/* Pulsing outer ring */}
                    <motion.div
                        className={`absolute rounded-full ${getRiskColor(district.risk)} opacity-30`}
                        animate={{ scale: [1, 1.8], opacity: [0.6, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
                        style={{ width: 40, height: 40 }}
                    />

                    {/* Main dot */}
                    <motion.div
                        className={`relative w-8 h-8 rounded-full ${getRiskColor(district.risk)} shadow-lg flex items-center justify-center`}
                        whileHover={{ scale: 1.3 }}
                    >
                        <span className="text-white text-xs font-bold">{district.risk}</span>
                    </motion.div>

                    {/* Tooltip on hover */}
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        whileHover={{ opacity: 1, y: -5 }}
                        className="absolute top-full mt-2 bg-white px-2 py-1 rounded-lg text-xs font-semibold text-slate-800 whitespace-nowrap pointer-events-none shadow-lg"
                    >
                        {district.name}
                    </motion.div>
                </motion.div>
            ))}

            <div className="absolute bottom-3 left-3 text-xs text-slate-600 font-semibold">Tamil Nadu District Heatmap</div>
        </motion.div>
    );
};


/* ─── Landing Page ──────────────────────────────────────────────── */
const LandingPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const featuresRef = useRef(null);
    const stepsRef = useRef(null);
    const stepsInView = useInView(stepsRef, { once: true, margin: '0px 0px -80px 0px' });

    const goToApp = () => {
        if (user) {
            const map = { teacher: '/upload', principal: '/dashboard', deo: '/heatmap' };
            navigate(map[user.role] || '/dashboard');
        } else {
            navigate('/auth');
        }
    };

    return (
        <div className="overflow-x-hidden">

            {/* ── Hero ── */}
            <section className="relative min-h-screen flex items-center justify-center text-center px-6 py-28 overflow-hidden">
                {/* Animated floating particle background */}
                <FloatingParticles />

                {/* Animated gradient orbs */}
                <Orb className="w-96 h-96 bg-green-400 top-[-80px] left-[-80px]" animate={{ x: [0, 40, 0], y: [0, 30, 0] }} />
                <Orb className="w-80 h-80 bg-teal-300 bottom-[-60px] right-[-60px]" animate={{ x: [0, -30, 0], y: [0, -40, 0] }} />
                <Orb className="w-64 h-64 bg-emerald-500 top-1/2 right-[10%]" animate={{ x: [0, 20, 0], y: [0, -20, 0] }} />

                {/* Subtle grid overlay */}
                <div className="absolute inset-0 pointer-events-none"
                    style={{ backgroundImage: 'radial-gradient(circle, #e2e8f0 1px, transparent 1px)', backgroundSize: '40px 40px', opacity: 0.4 }}
                />

                <div className="relative z-10 max-w-5xl mx-auto">
                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 bg-white border border-green-200 text-green-800 px-4 py-2 rounded-full text-sm font-semibold mb-8 shadow-sm"
                    >
                        <motion.span
                            animate={{ scale: [1, 1.3, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            <ShieldCheck size={15} className="text-green-600" />
                        </motion.span>
                        GOVERNMENT OF INDIA · AI INITIATIVE
                    </motion.div>

                    {/* Headline */}
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.1 }}
                        className="text-5xl md:text-7xl font-black text-slate-800 leading-tight mb-6"
                    >
                        Stop Dropout<br />
                        <span className="relative">
                            <span className="text-primary">Before It Happens.</span>
                            {/* Animated underline */}
                            <motion.span
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                transition={{ duration: 0.8, delay: 0.8, ease: 'easeOut' }}
                                className="absolute -bottom-1 left-0 right-0 h-1 bg-primary/30 rounded-full origin-left"
                            />
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed mb-10"
                    >
                        EduGuard uses AI to predict which students are at risk of dropping out —
                        and automatically alerts parents, teachers, and volunteers before it's too late.
                    </motion.p>

                    {/* CTAs */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.45 }}
                        className="flex flex-wrap gap-4 justify-center mb-16"
                    >
                        <motion.button
                            whileHover={{ scale: 1.05, boxShadow: '0 12px 40px rgba(46,125,50,0.3)' }}
                            whileTap={{ scale: 0.97 }}
                            onClick={goToApp}
                            className="flex items-center gap-2 bg-primary text-white px-9 py-4 rounded-xl font-bold text-base shadow-lg hover:bg-primary/90 transition-all"
                        >
                            {user ? 'Go to Dashboard' : 'Get Started'} <ArrowRight size={18} />
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => featuresRef.current?.scrollIntoView({ behavior: 'smooth' })}
                            className="flex items-center gap-2 bg-white text-slate-700 px-9 py-4 rounded-xl font-semibold text-base border border-slate-200 hover:bg-slate-50 transition-all shadow-sm"
                        >
                            Explore Features
                        </motion.button>
                    </motion.div>

                    {/* Live alert ticker floating below CTAs */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.7 }}
                        className="flex justify-center"
                    >
                        <LiveAlertTicker />
                    </motion.div>
                </div>
            </section>

            {/* ── Advanced Data Flow Visualization ── */}
            <section className="py-16 bg-gradient-to-b from-white to-slate-50/50 relative overflow-hidden">
                <div className="max-w-4xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="text-center mb-8"
                    >
                        <h3 className="text-2xl font-black text-slate-800 mb-2">How Data Becomes Insights</h3>
                        <p className="text-slate-500 text-sm">Real-time processing of student data into actionable risk scores</p>
                    </motion.div>
                    <DataFlowVisualization />
                </div>
            </section>

            {/* ── Stats ── */}
            <section className="py-20 bg-white border-b border-slate-100">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        {/* Left: Animated Gauge */}
                        <motion.div
                            initial={{ opacity: 0, x: -40 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="flex justify-center"
                        >
                            <AnimatedRiskGauge risk={65} students={127} />
                        </motion.div>

                        {/* Right: Animated Impact Stats */}
                        <motion.div
                            initial={{ opacity: 0, x: 40 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="space-y-8"
                        >
                            <div>
                                <h3 className="text-2xl font-black text-slate-800 mb-8">Measurable Impact</h3>
                            </div>
                            <AnimatedImpactStat label="Students Monitored" value={12000} max={15000} color="bg-blue-500" />
                            <AnimatedImpactStat label="Dropout Rate Reduced" value={37} max={50} color="bg-green-500" />
                            <AnimatedImpactStat label="Model Accuracy" value={98} max={100} color="bg-purple-500" />
                            <AnimatedImpactStat label="Students Retained" value={847} max={1000} color="bg-emerald-500" />
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ── How It Works ── */}
            <section ref={stepsRef} className="py-24 bg-slate-50/60">
                <div className="max-w-5xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="text-center mb-14"
                    >
                        <h2 className="text-3xl font-black text-slate-800 mb-3">How EduGuard Works</h2>
                        <p className="text-slate-500">Four steps from raw data to saved futures.</p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                        {STEPS.map(({ step, label, icon: Icon, desc }, i) => (
                            <motion.div
                                key={step}
                                initial={{ opacity: 0, y: 30 }}
                                animate={stepsInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.5, delay: i * 0.12 }}
                                className="relative"
                            >
                                {i < STEPS.length - 1 && (
                                    <motion.div
                                        initial={{ scaleX: 0 }}
                                        animate={stepsInView ? { scaleX: 1 } : {}}
                                        transition={{ duration: 0.6, delay: 0.5 + i * 0.12 }}
                                        className="hidden md:block absolute top-8 left-[calc(100%-8px)] w-full h-0.5 bg-gradient-to-r from-primary/30 to-transparent z-0 origin-left"
                                    />
                                )}
                                <motion.div
                                    whileHover={{ y: -4, boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}
                                    className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm relative z-10 h-full transition-all cursor-default"
                                >
                                    <div className="text-xs font-black text-primary/30 mb-3 tracking-widest">{step}</div>
                                    <motion.div
                                        animate={{ rotate: [0, 5, -5, 0] }}
                                        transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
                                        className="w-11 h-11 rounded-xl bg-primary/8 flex items-center justify-center mb-4"
                                    >
                                        <Icon size={20} className="text-primary" />
                                    </motion.div>
                                    <h3 className="font-bold text-slate-800 mb-2">{label}</h3>
                                    <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
                                </motion.div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Features Grid ── */}
            <section ref={featuresRef} className="py-24 bg-white">
                <div className="max-w-5xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="text-center mb-14"
                    >
                        <h2 className="text-3xl font-black text-slate-800 mb-3">Everything You Need</h2>
                        <p className="text-slate-500">A complete system for every stakeholder in education.</p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {FEATURES.map(({ icon: Icon, title, desc, color, bg, border }, i) => (
                            <motion.div
                                key={title}
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: i * 0.07 }}
                                whileHover={{ y: -5, boxShadow: '0 12px 32px rgba(0,0,0,0.09)' }}
                                className={`p-6 rounded-2xl border ${border} bg-white transition-all cursor-default`}
                            >
                                <motion.div
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    className={`inline-flex p-3 rounded-xl ${bg} mb-4 transition-all`}
                                >
                                    <Icon size={22} className={color} />
                                </motion.div>
                                <h3 className="font-bold text-slate-800 mb-2">{title}</h3>
                                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── District Heatmap Preview ── */}
            <section className="py-24 bg-slate-50/50">
                <div className="max-w-4xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl font-black text-slate-800 mb-3">Real-Time Risk Visualization</h2>
                        <p className="text-slate-500 max-w-2xl mx-auto">See at-risk students by geographic location for resource planning</p>
                    </motion.div>
                    <HeatmapPreview />
                </div>
            </section>

            {/* ── Success Stories with Advanced Animations ── */}
            <section className="py-24 bg-white">
                <div className="max-w-5xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="text-center mb-4"
                    >
                        <h2 className="text-3xl font-black text-slate-800 mb-3">Success Stories</h2>
                        <p className="text-slate-500">Real students, real impact, real change</p>
                    </motion.div>
                    <SuccessStories />
                </div>
            </section>

            {/* ── Testimonial / Social Proof ── */}
            <section className="py-20 bg-slate-50 border-y border-slate-100">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="flex justify-center gap-1 mb-4">
                            {[...Array(5)].map((_, i) => (
                                <motion.span
                                    key={i}
                                    initial={{ opacity: 0, scale: 0 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.08, type: 'spring' }}
                                    className="text-yellow-400 text-2xl"
                                >★</motion.span>
                            ))}
                        </div>
                        <blockquote className="text-xl font-semibold text-slate-700 leading-relaxed mb-4 max-w-2xl mx-auto">
                            "Within one month of using EduGuard, we identified 12 at-risk students and retained 9 of them. The WhatsApp alerts to parents were the game changer."
                        </blockquote>
                        <p className="text-slate-500 font-medium">— Ramesh Kumar, Government High School, Tamil Nadu</p>
                    </motion.div>
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="py-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-teal-700 pointer-events-none" />
                <Orb className="w-96 h-96 bg-white top-[-40px] right-[-80px]" animate={{ x: [0, -30, 0], y: [0, 20, 0] }} />
                <Orb className="w-64 h-64 bg-teal-200 bottom-[-40px] left-[-40px]" animate={{ x: [0, 20, 0], y: [0, -20, 0] }} />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="relative z-10 max-w-2xl mx-auto px-6 text-center text-white"
                >
                    <motion.div
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    >
                        <GraduationCap size={48} className="mx-auto mb-6 opacity-90" />
                    </motion.div>
                    <h2 className="text-4xl font-black mb-4">Ready to protect every student?</h2>
                    <p className="text-white/80 text-lg mb-10">
                        Join teachers and officials across India already using EduGuard.
                    </p>
                    <motion.button
                        whileHover={{ scale: 1.05, boxShadow: '0 16px 48px rgba(0,0,0,0.3)' }}
                        whileTap={{ scale: 0.97 }}
                        onClick={goToApp}
                        className="bg-white text-primary font-bold px-12 py-4 rounded-xl text-lg shadow-xl hover:bg-slate-50 transition-all inline-flex items-center gap-2"
                    >
                        Get Started Now <ArrowRight />
                    </motion.button>
                </motion.div>
            </section>

            {/* ── Footer ── */}
            <footer className="py-8 text-center text-slate-400 text-sm border-t border-slate-100 bg-white">
                <p>EduGuard · Government of India AI Initiative · Built to protect India's students</p>
            </footer>
        </div>
    );
};

export default LandingPage;
