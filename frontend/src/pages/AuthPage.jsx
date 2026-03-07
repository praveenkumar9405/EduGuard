import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { GraduationCap, Building2, Landmark, ArrowRight, ArrowLeft, Eye, EyeOff, BookOpen } from 'lucide-react';

const ROLES = [
    {
        id: 'teacher',
        label: 'Teacher',
        icon: GraduationCap,
        color: 'from-emerald-500 to-teal-600',
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        text: 'text-emerald-700',
        ring: 'ring-emerald-400',
        description: 'Upload student data & view class risk reports',
        redirectTo: '/upload',
        schoolLabel: 'School Name',
    },
    {
        id: 'principal',
        label: 'Principal',
        icon: Building2,
        color: 'from-blue-500 to-indigo-600',
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-700',
        ring: 'ring-blue-400',
        description: 'Monitor all classes & overall school risk dashboard',
        redirectTo: '/dashboard',
        schoolLabel: 'School Name',
    },
    {
        id: 'deo',
        label: 'District Education Officer',
        icon: Landmark,
        color: 'from-violet-500 to-purple-600',
        bg: 'bg-violet-50',
        border: 'border-violet-200',
        text: 'text-violet-700',
        ring: 'ring-violet-400',
        description: 'District-wide heatmap & inter-school analytics',
        redirectTo: '/heatmap',
        schoolLabel: 'District Name',
    },
];

const FloatingBook = ({ style }) => (
    <div className="absolute opacity-5 text-slate-800 pointer-events-none select-none" style={style}>
        <BookOpen size={40} />
    </div>
);

const AuthPage = () => {
    const [step, setStep] = useState(1); // 1: role select, 2: login form
    const [selectedRole, setSelectedRole] = useState(null);
    const [name, setName] = useState('');
    const [school, setSchool] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    const roleData = ROLES.find(r => r.id === selectedRole);

    const handleRoleSelect = (roleId) => {
        setSelectedRole(roleId);
        setStep(2);
        setError('');
    };

    const handleLogin = (e) => {
        e.preventDefault();
        if (!name.trim() || !school.trim()) {
            setError('Please fill in all fields.');
            return;
        }
        login({ name: name.trim(), school: school.trim(), role: selectedRole });
        navigate(roleData.redirectTo);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center px-4 relative overflow-hidden">
            {/* Background decorations */}
            <FloatingBook style={{ top: '8%', left: '5%', transform: 'rotate(-15deg)' }} />
            <FloatingBook style={{ top: '15%', right: '8%', transform: 'rotate(10deg)' }} />
            <FloatingBook style={{ bottom: '10%', left: '10%', transform: 'rotate(8deg)' }} />
            <FloatingBook style={{ bottom: '20%', right: '5%', transform: 'rotate(-12deg)' }} />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(46,125,50,0.08),transparent)] pointer-events-none" />

            <div className="w-full max-w-3xl">
                {/* Logo */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <div className="inline-flex items-center gap-2 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg">
                            <span className="text-white font-bold text-xl">E</span>
                        </div>
                        <span className="text-2xl font-bold text-slate-800">
                            Edu<span className="text-primary">Guard</span>
                        </span>
                    </div>
                    <p className="text-slate-500 text-sm">AI-Powered Student Dropout Prevention System</p>
                </motion.div>

                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div
                            key="role-select"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.35 }}
                        >
                            <div className="text-center mb-8">
                                <h1 className="text-2xl font-bold text-slate-800 mb-2">Who are you logging in as?</h1>
                                <p className="text-slate-500 text-sm">Select your role to continue</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {ROLES.map((role, i) => {
                                    const Icon = role.icon;
                                    return (
                                        <motion.button
                                            key={role.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.08 }}
                                            whileHover={{ y: -4, scale: 1.01 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => handleRoleSelect(role.id)}
                                            className={`p-6 rounded-2xl border-2 ${role.bg} ${role.border} text-left transition-all group cursor-pointer hover:shadow-lg`}
                                        >
                                            <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${role.color} shadow-md mb-4`}>
                                                <Icon size={24} className="text-white" />
                                            </div>
                                            <h3 className={`font-bold text-lg ${role.text} mb-2 leading-tight`}>{role.label}</h3>
                                            <p className="text-slate-500 text-sm leading-relaxed">{role.description}</p>
                                            <div className={`mt-4 flex items-center gap-1 text-sm font-semibold ${role.text} opacity-0 group-hover:opacity-100 transition-opacity`}>
                                                Login as {role.label.split(' ')[0]} <ArrowRight size={14} />
                                            </div>
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && roleData && (
                        <motion.div
                            key="login-form"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.35 }}
                            className="max-w-md mx-auto"
                        >
                            <button
                                onClick={() => { setStep(1); setSelectedRole(null); setError(''); }}
                                className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6 text-sm font-medium transition-colors"
                            >
                                <ArrowLeft size={16} /> Back to role selection
                            </button>

                            <div className={`p-6 rounded-2xl border-2 ${roleData.bg} ${roleData.border}`}>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className={`p-2.5 rounded-xl bg-gradient-to-br ${roleData.color} shadow`}>
                                        <roleData.icon size={20} className="text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-800">Login as {roleData.label}</h2>
                                        <p className="text-slate-500 text-xs">{roleData.description}</p>
                                    </div>
                                </div>

                                <form onSubmit={handleLogin} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Your Full Name</label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={e => setName(e.target.value)}
                                            placeholder="e.g. Ramesh Kumar"
                                            className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-slate-800 placeholder:text-slate-400 transition-all"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">{roleData.schoolLabel}</label>
                                        <input
                                            type="text"
                                            value={school}
                                            onChange={e => setSchool(e.target.value)}
                                            placeholder={roleData.id === 'deo' ? 'e.g. Chennai District' : 'e.g. Govt High School, North Zone'}
                                            className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-slate-800 placeholder:text-slate-400 transition-all"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
                                        <div className="relative">
                                            <input
                                                type={showPass ? 'text' : 'password'}
                                                value={password}
                                                onChange={e => setPassword(e.target.value)}
                                                placeholder="Enter your password"
                                                className="w-full px-4 py-3 pr-12 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-slate-800 placeholder:text-slate-400 transition-all"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPass(v => !v)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                            >
                                                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>

                                    {error && (
                                        <motion.p
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="text-sm text-red-500 font-medium"
                                        >
                                            {error}
                                        </motion.p>
                                    )}

                                    <motion.button
                                        whileHover={{ scale: 1.01 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="submit"
                                        className={`w-full py-3 px-6 rounded-xl font-semibold text-white bg-gradient-to-r ${roleData.color} shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2`}
                                    >
                                        Login <ArrowRight size={18} />
                                    </motion.button>
                                </form>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default AuthPage;
