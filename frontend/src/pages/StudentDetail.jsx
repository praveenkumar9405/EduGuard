import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
    getStudentAPI, recommendInterventionsAPI,
    generateParentMessageAPI, matchSchemesAPI, generateVolunteerMessageAPI
} from '../services/api';
import Card from '../components/Card';
import RiskGauge from '../components/RiskGauge';
import RiskBadge from '../components/RiskBadge';
import {
    ArrowLeft, MessageCircle, Copy, CheckSquare, ExternalLink,
    Calendar, MapPin, Layers, Briefcase, GraduationCap, Megaphone, SendHorizonal
} from 'lucide-react';

// Build WhatsApp deep-link
const buildWhatsAppLink = (phone, message) =>
    `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

const DEMO_ABSENT = true; // For demo: treat student as absent so volunteer section shows

const StudentDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [interventions, setInterventions] = useState([]);
    const [parentMessage, setParentMessage] = useState('');
    const [volunteerMessage, setVolunteerMessage] = useState('');
    const [schemes, setSchemes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [messageLang, setMessageLang] = useState('english');
    const [copied, setCopied] = useState(false);
    const [volunteerCopied, setVolunteerCopied] = useState(false);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const student = await getStudentAPI(id);
                setData(student);
                const inters = await recommendInterventionsAPI(id);
                setInterventions(inters);
                const msg = await generateParentMessageAPI(id, messageLang);
                setParentMessage(msg.message);
                const vmsg = await generateVolunteerMessageAPI(id);
                setVolunteerMessage(vmsg.message);
                const sch = await matchSchemesAPI(id);
                setSchemes(sch);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, [id, messageLang]);

    const handleCopy = (text, setter) => {
        navigator.clipboard.writeText(text);
        setter(true);
        setTimeout(() => setter(false), 2000);
    };

    if (loading) return <div className="text-center p-12 text-slate-500 font-medium">Loading Student Profile...</div>;
    if (!data) return <div className="text-center p-12 text-red-500 font-medium">Error loading student data.</div>;

    return (
        <div className="max-w-7xl mx-auto px-6">
            <button onClick={() => navigate(-1)} className="text-slate-500 hover:text-slate-800 flex items-center gap-2 mb-6 font-medium transition-colors">
                <ArrowLeft size={18} /> Back to Dashboard
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column */}
                <div className="lg:col-span-1 space-y-6">
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                        <Card className="flex flex-col items-center p-8 text-center relative overflow-hidden">
                            <div className="absolute top-0 w-full h-2 bg-gradient-to-r from-primary to-accent" />
                            <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center text-3xl font-bold border-4 border-white shadow-sm text-primary mb-4">
                                {data.name.charAt(0)}
                            </div>
                            <h2 className="text-2xl font-bold text-slate-800">{data.name}</h2>
                            <p className="text-slate-500 mb-4">{data.student_id} • Class {data.class}</p>
                            <RiskBadge level={data.risk_profile.risk_level} />
                        </Card>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
                        <Card>
                            <h3 className="text-lg font-semibold text-slate-800 mb-6">Overall Risk Score</h3>
                            <div className="flex justify-center mb-6">
                                <RiskGauge score={data.risk_profile.risk_score} />
                            </div>
                            <div className="space-y-4">
                                <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Top Risk Factors</h4>
                                {data.risk_profile.top_factors.map((factor, idx) => (
                                    <div key={idx} className="bg-slate-50 border border-slate-100 p-3 rounded-xl mb-3">
                                        <div className="flex justify-between text-sm mb-1.5 align-middle">
                                            <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                                                <span className={`w-2 h-2 rounded-full ${idx === 0 ? 'bg-red-500' : 'bg-orange-400'}`} />
                                                {factor.factor}
                                            </span>
                                            <span className="text-slate-500 font-bold bg-white px-2 py-0.5 rounded-md shadow-sm border border-slate-200">{factor.weight}%</span>
                                        </div>
                                        <div className="w-full bg-slate-200/60 rounded-full h-1.5 mb-2.5 overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${factor.weight}%` }}
                                                transition={{ duration: 1, delay: 0.5 + idx * 0.1 }}
                                                className={`h-full rounded-full ${idx === 0 ? 'bg-red-500' : 'bg-orange-400'}`}
                                            />
                                        </div>
                                        <p className="text-xs text-slate-500 leading-relaxed italic border-l-2 pl-2 border-slate-300">
                                            "{factor.reason}"
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </motion.div>
                </div>

                {/* Right Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Card className="p-4" hover>
                            <Calendar className="text-accent mb-2" size={20} />
                            <p className="text-sm text-slate-500 mb-1">Attendance</p>
                            <p className="text-xl font-bold text-slate-800">{data.attendance_rate}%</p>
                        </Card>
                        <Card className="p-4" hover>
                            <GraduationCap className="text-accent mb-2" size={20} />
                            <p className="text-sm text-slate-500 mb-1">Last Exam</p>
                            <p className="text-xl font-bold text-slate-800">{data.last_exam_score}%</p>
                        </Card>
                        <Card className="p-4" hover>
                            <MapPin className="text-accent mb-2" size={20} />
                            <p className="text-sm text-slate-500 mb-1">Distance</p>
                            <p className="text-xl font-bold text-slate-800">{data.distance_from_school_km} km</p>
                        </Card>
                        <Card className="p-4" hover>
                            <Briefcase className="text-accent mb-2" size={20} />
                            <p className="text-sm text-slate-500 mb-1">Income Level</p>
                            <p className="text-base font-bold text-slate-800">{data.family_income_level}</p>
                        </Card>
                    </div>

                    {/* Academic Chart */}
                    <Card>
                        <h3 className="text-lg font-semibold text-slate-800 mb-6">Academic Trend</h3>
                        <div className="h-56">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={data.exam_history}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dy={10} />
                                    <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dx={-10} />
                                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                    <Line type="monotone" dataKey="score" stroke="#4A90E2" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} animationDuration={1500} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    {/* Interventions & Schemes */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                <Layers className="text-primary" /> Recommended Interventions
                            </h3>
                            <div className="space-y-3">
                                {interventions.map((int, i) => (
                                    <div key={i} className="p-4 border border-green-100 bg-green-50/50 hover:bg-green-50 transition-colors rounded-xl relative overflow-hidden group">
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500" />
                                        <h4 className="font-bold text-green-800 flex items-center gap-2">
                                            {int.name}
                                        </h4>
                                        <p className="text-xs font-medium text-green-700/70 mt-1">{int.description}</p>
                                        <div className="mt-3 pt-3 border-t border-green-200/60">
                                            <h5 className="text-[10px] uppercase font-bold text-green-600/60 tracking-wider mb-1">Why this helps</h5>
                                            <p className="text-sm text-green-800/90 leading-snug">{int.explanation}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        <Card>
                            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                <CheckSquare className="text-accent" /> Government Schemes
                            </h3>
                            {schemes.length === 0 ? (
                                <p className="text-slate-500 text-sm">No eligible schemes matched.</p>
                            ) : (
                                <div className="space-y-3">
                                    {schemes.map((s, i) => (
                                        <div key={i} className="p-4 border border-blue-100 bg-blue-50/50 rounded-xl">
                                            <h4 className="font-semibold text-blue-800 flex justify-between">{s.name} <ExternalLink size={16} /></h4>
                                            <div className="mt-2 text-xs font-medium text-blue-600 flex flex-wrap gap-1.5">
                                                {s.checklist.map((c, j) => (
                                                    <span key={j} className="bg-white px-2 py-1 rounded shadow-sm border border-blue-100">{c}</span>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card>
                    </div>

                    {/* Parent WhatsApp Notification */}
                    <Card>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                                <MessageCircle className="text-green-600" /> Parent Notification
                            </h3>
                            <div className="flex bg-slate-100 p-1 rounded-lg gap-1">
                                {['english', 'tamil', 'hindi'].map(lang => (
                                    <button
                                        key={lang}
                                        onClick={() => setMessageLang(lang)}
                                        className={`px-3 py-1 text-sm font-medium rounded-md transition-colors capitalize
                      ${messageLang === lang ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        {lang.charAt(0).toUpperCase() + lang.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <p className="text-xs text-slate-400 mb-2 font-medium">Message drafted in natural language — edit before sending:</p>
                        <div className="relative mb-4">
                            <textarea
                                value={parentMessage}
                                onChange={e => setParentMessage(e.target.value)}
                                className="w-full h-28 p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-400 text-sm"
                            />
                            <button
                                onClick={() => handleCopy(parentMessage, setCopied)}
                                className="absolute bottom-3 right-3 text-slate-500 hover:text-slate-800 bg-white shadow-sm border border-slate-200 p-2 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-medium"
                            >
                                {copied ? <CheckSquare size={14} className="text-green-500" /> : <Copy size={14} />}
                                {copied ? 'Copied!' : 'Copy'}
                            </button>
                        </div>

                        <div className="flex gap-3">
                            <motion.a
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                href={buildWhatsAppLink('91XXXXXXXXXX', parentMessage)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-xl font-semibold text-sm shadow-md transition-all"
                            >
                                <SendHorizonal size={16} /> Send via WhatsApp
                            </motion.a>
                            <p className="text-xs text-slate-400 self-center">Replace <code className="bg-slate-100 px-1 rounded">91XXXXXXXXXX</code> with parent's number in production</p>
                        </div>
                    </Card>

                    {/* Volunteer Alert (shown if student is high risk or absent) */}
                    {
                        (data.risk_profile.risk_level === 'High' || DEMO_ABSENT) && (
                            <Card>
                                <div className="flex items-center gap-2 mb-4">
                                    <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                                        <Megaphone className="text-orange-500" /> Volunteer Alert
                                    </h3>
                                    <span className="text-xs bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded-full">ABSENT TODAY</span>
                                </div>

                                <p className="text-xs text-slate-400 mb-2 font-medium">Alert message for community volunteer — edit if needed:</p>
                                <div className="relative mb-4">
                                    <textarea
                                        value={volunteerMessage}
                                        onChange={e => setVolunteerMessage(e.target.value)}
                                        className="w-full h-24 p-4 bg-orange-50 border border-orange-200 rounded-xl text-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 text-sm"
                                    />
                                    <button
                                        onClick={() => handleCopy(volunteerMessage, setVolunteerCopied)}
                                        className="absolute bottom-3 right-3 text-slate-500 hover:text-slate-800 bg-white shadow-sm border border-slate-200 p-2 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-medium"
                                    >
                                        {volunteerCopied ? <CheckSquare size={14} className="text-green-500" /> : <Copy size={14} />}
                                        {volunteerCopied ? 'Copied!' : 'Copy'}
                                    </button>
                                </div>

                                <motion.a
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    href={buildWhatsAppLink('91XXXXXXXXXX', volunteerMessage)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-xl font-semibold text-sm shadow-md transition-all"
                                >
                                    <SendHorizonal size={16} /> Alert Volunteer via WhatsApp
                                </motion.a>
                            </Card>
                        )
                    }
                </div >
            </div >
        </div >
    );
};

export default StudentDetail;
