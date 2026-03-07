import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { predictRiskAPI } from '../services/api';
import Card from '../components/Card';
import RiskBadge from '../components/RiskBadge';
import { useAuth } from '../AuthContext';
import {
    Search, AlertTriangle, ArrowRight, Activity, Users,
    ChevronUp, ChevronDown, ChevronsUpDown,
    MessageCircle, Megaphone, SendHorizonal
} from 'lucide-react';

const FILTER_OPTIONS = ['All', 'High', 'Medium', 'Low'];

const SortIcon = ({ field, sortField, sortDir }) => {
    if (sortField !== field) return <ChevronsUpDown size={14} className="text-slate-300" />;
    return sortDir === 'asc'
        ? <ChevronUp size={14} className="text-primary" />
        : <ChevronDown size={14} className="text-primary" />;
};

// Build WhatsApp wa.me deep-link
const buildWhatsAppLink = (phone, message) => {
    const encoded = encodeURIComponent(message);
    return `https://wa.me/${phone}?text=${encoded}`;
};

// Generate human-style parent message
const buildParentMsg = (student) =>
    `Namaste, I am writing to you regarding your child ${student.name} (Class ${student.class}). ` +
    `We have noticed some concern in their school attendance and performance lately. ` +
    `Their current risk score is ${student.risk_score}%. ` +
    `We would love to work together to support ${student.name}. ` +
    `Please feel free to contact the school at your convenience. Thank you.`;

// Generate volunteer alert message
const buildVolunteerMsg = (student) =>
    `Hello, this is an alert from EduGuard — ${student.name} (Class ${student.class}) ` +
    `has not attended school today and is flagged as ${student.risk_level} risk for dropout. ` +
    `Could you please do a welfare check? Their home is in the school vicinity. Thank you for your support.`;

const Dashboard = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('All');
    const [sortField, setSortField] = useState('risk_score');
    const [sortDir, setSortDir] = useState('desc');
    const [absentIds] = useState(() => new Set()); // populated after load
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const data = await predictRiskAPI();
                setStudents(data);
                // Mark ~20% of students as absent (mock)
                const highRisk = data.filter(s => s.risk_level === 'High');
                highRisk.slice(0, Math.ceil(highRisk.length * 0.4)).forEach(s => absentIds.add(s.student_id));
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchStudents();
    }, []);

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDir(field === 'risk_score' ? 'desc' : 'asc');
        }
    };

    const filtered = students
        .filter(s => {
            const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
                s.student_id.toLowerCase().includes(search.toLowerCase());
            const matchFilter = filter === 'All' || s.risk_level === filter;
            return matchSearch && matchFilter;
        })
        .sort((a, b) => {
            let valA = a[sortField];
            let valB = b[sortField];
            if (typeof valA === 'string') valA = valA.toLowerCase();
            if (typeof valB === 'string') valB = valB.toLowerCase();
            if (valA < valB) return sortDir === 'asc' ? -1 : 1;
            if (valA > valB) return sortDir === 'asc' ? 1 : -1;
            return 0;
        });

    const highRiskCount = students.filter(s => s.risk_level === 'High').length;
    const absentCount = students.filter(s => absentIds.has(s.student_id)).length;
    const avgRisk = students.length
        ? Math.round(students.reduce((acc, s) => acc + s.risk_score, 0) / students.length)
        : 0;

    const handleBulkNotify = () => {
        const highRisk = students.filter(s => s.risk_level === 'High');
        if (!highRisk.length) return;
        const student = highRisk[0];
        const msg = buildParentMsg(student);
        window.open(buildWhatsAppLink('91XXXXXXXXXX', msg), '_blank');
    };

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto px-6 h-64 flex flex-col items-center justify-center">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="mb-4">
                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full" />
                </motion.div>
                <p className="text-slate-500 font-medium">Loading AI Predictions...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-6xl mx-auto px-6 py-12 text-center">
                <Card className="p-12">
                    <AlertTriangle className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-semibold text-slate-800 mb-2">No Data Available</h2>
                    <p className="text-slate-500 mb-6">Please upload a student dataset or use demo data first.</p>
                    <button onClick={() => navigate('/upload')} className="px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium">
                        Go to Data Ingestion
                    </button>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-6">
            {/* Welcome banner */}
            {user && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Welcome back, {user.name} 👋</h1>
                        <p className="text-slate-500 text-sm mt-0.5">{user.school}</p>
                    </div>
                    {highRiskCount > 0 && (
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleBulkNotify}
                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-md transition-all"
                        >
                            <SendHorizonal size={16} />
                            Send All High-Risk Alerts
                        </motion.button>
                    )}
                </motion.div>
            )}

            {/* Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
                {[
                    { icon: <Users size={22} />, label: 'Total Students', value: students.length, color: 'blue' },
                    { icon: <AlertTriangle size={22} />, label: 'High Risk', value: highRiskCount, color: 'red' },
                    { icon: <Activity size={22} />, label: 'Avg Risk Score', value: `${avgRisk}%`, color: 'orange' },
                    { icon: <Megaphone size={22} />, label: 'Absent Today', value: absentCount, color: 'violet' },
                ].map(({ icon, label, value, color }, i) => (
                    <motion.div key={label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: i * 0.07 }}>
                        <Card className="flex items-center gap-4">
                            <div className={`p-3 bg-${color}-100 text-${color}-600 rounded-xl`}>{icon}</div>
                            <div>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
                                <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <div className="flex flex-wrap justify-between items-end gap-4 mb-5">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 tracking-tight">Student Risk Dashboard</h2>
                    <p className="text-slate-500 text-sm mt-1">Click a student to view detailed profile & send notifications.</p>
                </div>
                <div className="flex flex-wrap gap-3 items-center">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                        <input
                            type="text"
                            placeholder="Search students..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary w-52 bg-white text-sm"
                        />
                    </div>
                    <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1 gap-1">
                        {FILTER_OPTIONS.map(opt => (
                            <button
                                key={opt}
                                onClick={() => setFilter(opt)}
                                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all
                  ${filter === opt
                                        ? opt === 'High' ? 'bg-red-500 text-white'
                                            : opt === 'Medium' ? 'bg-orange-400 text-white'
                                                : opt === 'Low' ? 'bg-green-500 text-white'
                                                    : 'bg-slate-800 text-white'
                                        : 'text-slate-500 hover:bg-slate-100'
                                    }`}
                            >
                                {opt}
                                {opt !== 'All' && (
                                    <span className="ml-1 opacity-70">
                                        ({students.filter(s => s.risk_level === opt).length})
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <Card className="overflow-hidden p-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs tracking-wider uppercase font-semibold">
                                <th className="px-6 py-4">
                                    <button onClick={() => handleSort('name')} className="flex items-center gap-1 hover:text-slate-800 transition-colors">
                                        Student <SortIcon field="name" sortField={sortField} sortDir={sortDir} />
                                    </button>
                                </th>
                                <th className="px-6 py-4">
                                    <button onClick={() => handleSort('class')} className="flex items-center gap-1 hover:text-slate-800 transition-colors">
                                        Class <SortIcon field="class" sortField={sortField} sortDir={sortDir} />
                                    </button>
                                </th>
                                <th className="px-6 py-4">Risk Level</th>
                                <th className="px-6 py-4">
                                    <button onClick={() => handleSort('risk_score')} className="flex items-center gap-1 hover:text-slate-800 transition-colors">
                                        Risk Score <SortIcon field="risk_score" sortField={sortField} sortDir={sortDir} />
                                    </button>
                                </th>
                                <th className="px-6 py-4">Attendance</th>
                                <th className="px-6 py-4">Primary Factor</th>
                                <th className="px-6 py-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence>
                                {filtered.map((student, i) => {
                                    const isAbsent = absentIds.has(student.student_id);
                                    const parentMsg = buildParentMsg(student);
                                    const volunteerMsg = buildVolunteerMsg(student);
                                    return (
                                        <motion.tr
                                            key={student.student_id}
                                            initial={{ opacity: 0, y: 6 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.22, delay: i * 0.025 }}
                                            className={`border-b border-slate-50 hover:bg-slate-50/60 transition-colors group ${isAbsent ? 'bg-red-50/30' : ''}`}
                                        >
                                            <td className="px-6 py-4 cursor-pointer" onClick={() => navigate(`/student/${student.student_id}`)}>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-sm">
                                                        {student.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-slate-800 flex items-center gap-2">
                                                            {student.name}
                                                            {isAbsent && <span className="text-xs font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">ABSENT</span>}
                                                        </div>
                                                        <div className="text-xs text-slate-400">{student.student_id}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600 font-medium cursor-pointer" onClick={() => navigate(`/student/${student.student_id}`)}>
                                                Class {student.class}
                                            </td>
                                            <td className="px-6 py-4 cursor-pointer" onClick={() => navigate(`/student/${student.student_id}`)}>
                                                <RiskBadge level={student.risk_level} />
                                            </td>
                                            <td className="px-6 py-4 w-36 cursor-pointer" onClick={() => navigate(`/student/${student.student_id}`)}>
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-sm font-bold tabular-nums
                            ${student.risk_level === 'High' ? 'text-red-600' :
                                                            student.risk_level === 'Medium' ? 'text-orange-500' : 'text-green-600'}`}>
                                                        {student.risk_score}%
                                                    </span>
                                                </div>
                                                <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${student.risk_score}%` }}
                                                        transition={{ duration: 0.8, delay: i * 0.02 }}
                                                        className={`h-1.5 rounded-full
                              ${student.risk_level === 'High' ? 'bg-red-500' :
                                                                student.risk_level === 'Medium' ? 'bg-orange-400' : 'bg-green-500'}`}
                                                    />
                                                </div>
                                            </td>
                                            {/* Attendance indicator */}
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full
                          ${isAbsent ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${isAbsent ? 'bg-red-500' : 'bg-green-500'}`} />
                                                    {isAbsent ? 'Absent' : 'Present'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 cursor-pointer" onClick={() => navigate(`/student/${student.student_id}`)}>
                                                <span className="text-sm text-slate-600 font-medium">
                                                    {student.top_factors[0]?.factor || 'N/A'}
                                                </span>
                                            </td>
                                            {/* Action buttons */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 justify-center">
                                                    <motion.a
                                                        whileHover={{ scale: 1.08 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        href={buildWhatsAppLink('91XXXXXXXXXX', parentMsg)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        title="Notify Parent via WhatsApp"
                                                        onClick={e => e.stopPropagation()}
                                                        className="flex items-center gap-1.5 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                                                    >
                                                        <MessageCircle size={13} /> Parent
                                                    </motion.a>
                                                    {isAbsent && (
                                                        <motion.a
                                                            whileHover={{ scale: 1.08 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            href={buildWhatsAppLink('91XXXXXXXXXX', volunteerMsg)}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            title="Alert Volunteer via WhatsApp"
                                                            onClick={e => e.stopPropagation()}
                                                            className="flex items-center gap-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                                                        >
                                                            <Megaphone size={13} /> Volunteer
                                                        </motion.a>
                                                    )}
                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        onClick={() => navigate(`/student/${student.student_id}`)}
                                                        className="opacity-0 group-hover:opacity-100 text-accent font-medium text-xs flex items-center gap-1 transition-opacity px-2 py-1.5"
                                                    >
                                                        View <ArrowRight size={12} />
                                                    </motion.button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </AnimatePresence>
                        </tbody>
                    </table>
                    {filtered.length === 0 && (
                        <div className="text-center py-12 text-slate-500 font-medium">
                            No students found matching your criteria.
                        </div>
                    )}
                </div>
                <div className="px-6 py-3 bg-slate-50/50 border-t border-slate-100 text-xs text-slate-400 font-medium">
                    Showing {filtered.length} of {students.length} students • {absentCount} absent today
                </div>
            </Card>
        </div>
    );
};

export default Dashboard;
