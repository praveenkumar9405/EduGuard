import { useEffect, useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    BookOpen, GraduationCap, TrendingUp, MessageSquare,
    Map, ShieldCheck, ArrowRight, Users, BarChart2, Bell,
    AlertCircle, CheckCircle2
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

            {/* ── Stats ── */}
            <section className="py-16 bg-white border-y border-slate-100">
                <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-10">
                    {[
                        { value: 12000, suffix: '+', label: 'Students Monitored', prefix: '' },
                        { value: 37, suffix: '%', label: 'Dropout Rate Reduced', prefix: '' },
                        { value: 4, suffix: '', label: 'Districts Covered', prefix: '' },
                        { value: 98, suffix: '%', label: 'Alert Accuracy', prefix: '' },
                    ].map(({ value, suffix, label, prefix }, i) => (
                        <motion.div
                            key={label}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: i * 0.1 }}
                            className="text-center"
                        >
                            <div className="text-4xl font-black text-primary mb-1">
                                <AnimatedCounter target={value} suffix={suffix} prefix={prefix} />
                            </div>
                            <p className="text-slate-500 text-sm font-medium">{label}</p>
                        </motion.div>
                    ))}
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
