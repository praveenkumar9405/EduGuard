import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { predictRiskAPI, logInterventionAPI, interventionOutcomeAPI } from '../services/api';
import Card from '../components/Card';
import { ShieldAlert, TrendingUp, CheckCircle, Search, Save } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const InterventionTracker = () => {
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState('');
    const [interventionType, setInterventionType] = useState('');
    const [date, setDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [outcomeData, setOutcomeData] = useState(null);

    const INTV_TYPES = [
        "Home Visit",
        "Counselling Session",
        "Peer Buddy Assignment",
        "Scholarship Assistance",
        "Transportation Support"
    ];

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const data = await predictRiskAPI();
                setStudents(data.filter(s => s.risk_level === 'High' || s.risk_level === 'Medium'));
            } catch (e) {
                console.error(e);
            }
        };
        fetchStudents();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedStudent || !interventionType || !date) return;
        setLoading(true);
        try {
            await logInterventionAPI({
                student_id: selectedStudent,
                intervention: interventionType,
                date: date
            });
            setSuccess(true);

            // Fetch comparison data automatically to display impact
            const outcome = await interventionOutcomeAPI(selectedStudent);
            setOutcomeData(outcome.metrics);

            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Intervention Tracker</h1>
                    <p className="text-slate-500 text-sm mt-1">Log actions taken and measure their impact.</p>
                </div>

                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <Card>
                        <h2 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2"><ShieldAlert className="text-primary" /> Log New Intervention</h2>

                        {students.length === 0 ? (
                            <div className="text-center py-10 bg-slate-50 rounded-xl border border-slate-200">
                                <ShieldAlert className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                <h3 className="text-slate-600 font-medium mb-1">No At-Risk Students Found</h3>
                                <p className="text-sm text-slate-500 px-4">Upload student data or load demo data from the Dashboard to start tracking interventions.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-1">Select Student (At-Risk)</label>
                                    <select
                                        value={selectedStudent}
                                        onChange={(e) => setSelectedStudent(e.target.value)}
                                        className="w-full border border-slate-200 rounded-lg p-2.5 bg-slate-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                    >
                                        <option value="">-- Choose a student --</option>
                                        {students.map(s => (
                                            <option key={s.student_id} value={s.student_id}>{s.name} ({s.student_id}) - {s.risk_level} Risk</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-1">Intervention Type</label>
                                    <select
                                        value={interventionType}
                                        onChange={(e) => setInterventionType(e.target.value)}
                                        className="w-full border border-slate-200 rounded-lg p-2.5 bg-slate-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                    >
                                        <option value="">-- Choose intervention --</option>
                                        {INTV_TYPES.map(t => (
                                            <option key={t} value={t}>{t}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-1">Date Conducted</label>
                                    <input
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="w-full border border-slate-200 rounded-lg p-2.5 bg-slate-50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-primary text-white font-medium py-3 rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 mt-4"
                                >
                                    {loading ? "Saving..." : <><Save size={18} /> Save Intervention</>}
                                </button>

                                {success && (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-green-100 text-green-700 p-3 rounded-lg border border-green-200 flex items-center gap-2 text-sm font-medium mt-4">
                                        <CheckCircle size={18} /> Successfully logged intervention!
                                    </motion.div>
                                )}
                            </form>
                        )}
                    </Card>
                </motion.div>
            </div>

            <div className="space-y-6 pt-12 md:pt-0">
                {outcomeData ? (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                        <Card className="h-full">
                            <h2 className="text-lg font-semibold text-slate-800 mb-2 flex items-center gap-2"><TrendingUp className="text-accent" /> Intervention Outcome</h2>
                            <p className="text-sm text-slate-500 mb-6">Impact of <strong>{interventionType}</strong> on student attendance.</p>

                            <div className="h-64 mt-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={outcomeData} layout="vertical" margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                                        <XAxis type="number" />
                                        <YAxis dataKey="name" type="category" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }} width={120} axisLine={false} tickLine={false} />
                                        <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                        <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                                        <Bar dataKey="before" name="Before" fill="#94a3b8" radius={[0, 4, 4, 0]} barSize={16} />
                                        <Bar dataKey="after" name="After (30 Days)" fill="#4A90E2" radius={[0, 4, 4, 0]} barSize={16} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                    </motion.div>
                ) : (
                    <div className="h-full flex items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                        <div className="text-center p-8">
                            <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                            <h3 className="text-lg font-semibold text-slate-600 mb-1">No Output Data</h3>
                            <p className="text-sm text-slate-400">Log an intervention to view its 30-day impact metrics.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InterventionTracker;
