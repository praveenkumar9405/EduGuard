import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, FileText, CheckCircle2, ArrowRight, Sparkles, User, BookOpen, AlertTriangle } from 'lucide-react';
import { uploadStudentsAPI, predictRiskAPI, loadDemoDataAPI } from '../services/api';
import Card from '../components/Card';
import { useAuth } from '../AuthContext';

const UploadPage = () => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('idle');
    const [error, setError] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const navigate = useNavigate();
    const inputRef = useRef(null);
    const { user } = useAuth();

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setStatus('idle');
            setError(null);
        }
    };

    const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = () => setIsDragging(false);

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const dropped = e.dataTransfer.files[0];
        if (dropped && dropped.name.endsWith('.csv')) {
            setFile(dropped);
            setStatus('idle');
            setError(null);
        } else {
            setError('Please drop a valid .csv file.');
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setLoading(true);
        setError(null);
        setStatus('uploading');
        try {
            await uploadStudentsAPI(file);
            setStatus('processing');
            await predictRiskAPI();
            setStatus('success');
            setTimeout(() => navigate('/dashboard'), 1500);
        } catch (err) {
            setError(err.message);
            setStatus('error');
        } finally {
            setLoading(false);
        }
    };

    const handleDemo = async () => {
        setLoading(true);
        setStatus('processing');
        setError(null);
        try {
            await loadDemoDataAPI();
            setStatus('success');
            setTimeout(() => navigate('/dashboard'), 1200);
        } catch {
            setError('Could not load demo data. Is the backend running?');
            setStatus('error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-6 pt-10 pb-16">
            {/* Teacher welcome banner */}
            {user && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-3 mb-8 w-fit"
                >
                    <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-sm">
                        {user.name.charAt(0)}
                    </div>
                    <div>
                        <p className="text-emerald-800 font-semibold text-sm">{user.name}</p>
                        <p className="text-emerald-600 text-xs">{user.school} • {user.role === 'teacher' ? 'Teacher' : user.role}</p>
                    </div>
                </motion.div>
            )}

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center mb-10"
            >
                <div className="inline-block bg-green-100 text-green-800 px-4 py-1.5 rounded-full text-sm font-semibold mb-5 tracking-wide">
                    GOVERNMENT OF INDIA • INITIATIVE
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-5 leading-tight">
                    Upload Student Data <br />
                    <span className="text-primary">to Generate Risk Predictions</span>
                </h1>
                <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
                    Upload your class's attendance, academic performance, and socio-economic data.
                    Our AI model will identify at-risk students instantly.
                </p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.15 }}
            >
                <Card className="max-w-2xl mx-auto p-10">
                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-slate-800">
                        <UploadCloud className="text-accent" /> Data Ingestion Portal
                    </h2>

                    {/* Drag & Drop Zone */}
                    <div
                        className={`border-2 border-dashed rounded-xl p-10 text-center transition-all cursor-pointer
                            ${isDragging ? 'border-primary bg-green-50 scale-[1.01]' : 'border-slate-300 hover:border-primary/50 hover:bg-slate-50'}`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => !file && inputRef.current?.click()}
                    >
                        <input ref={inputRef} type="file" accept=".csv" className="hidden" onChange={handleFileChange} />

                        {!file ? (
                            <>
                                <motion.div
                                    animate={{ y: [0, -5, 0] }}
                                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                                >
                                    <UploadCloud className="mx-auto w-14 h-14 text-slate-300 mb-4" />
                                </motion.div>
                                <p className="text-slate-600 font-medium mb-2">
                                    Drag & drop a CSV file here, or{' '}
                                    <span className="text-primary font-semibold underline underline-offset-2 cursor-pointer">browse</span>
                                </p>
                                <p className="text-xs text-slate-400">Supported format: .csv (student records)</p>
                            </>
                        ) : (
                            <div className="flex flex-col items-center">
                                <div className="bg-blue-50 text-accent p-4 rounded-full mb-4">
                                    <FileText className="w-8 h-8" />
                                </div>
                                <p className="font-semibold text-slate-700">{file.name}</p>
                                <p className="text-sm text-slate-500 mb-6">{(file.size / 1024).toFixed(1)} KB</p>

                                {status === 'idle' && (
                                    <div className="flex gap-3">
                                        <button
                                            onClick={handleUpload}
                                            className="bg-accent text-white px-8 py-3 rounded-lg font-medium hover:bg-accent/90 transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
                                        >
                                            Analyze Data <ArrowRight size={18} />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setFile(null); }}
                                            className="text-slate-500 hover:text-slate-700 px-4 py-3 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors text-sm font-medium"
                                        >
                                            Clear
                                        </button>
                                    </div>
                                )}

                                {(status === 'uploading' || status === 'processing') && (
                                    <div className="flex flex-col items-center text-accent">
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                            className="mb-4"
                                        >
                                            <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full" />
                                        </motion.div>
                                        <p className="font-medium animate-pulse">
                                            {status === 'uploading' ? 'Uploading Dataset...' : 'Running AI Models...'}
                                        </p>
                                    </div>
                                )}

                                {status === 'success' && (
                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex flex-col items-center text-green-600">
                                        <CheckCircle2 className="w-12 h-12 mb-2" />
                                        <p className="font-semibold">Analysis Complete! Redirecting...</p>
                                    </motion.div>
                                )}

                                {status === 'error' && (
                                    <div className="flex items-center gap-2 text-red-500 font-medium mt-4">
                                        <AlertTriangle size={18} /> {error}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Divider */}
                    <div className="flex items-center gap-4 my-6">
                        <div className="flex-1 h-px bg-slate-200" />
                        <span className="text-xs text-slate-400 font-medium uppercase tracking-widest">or try demo</span>
                        <div className="flex-1 h-px bg-slate-200" />
                    </div>

                    {/* Demo Button */}
                    {status === 'processing' && !file ? (
                        <div className="flex flex-col items-center text-accent py-2">
                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="mb-3">
                                <div className="w-7 h-7 border-4 border-accent border-t-transparent rounded-full" />
                            </motion.div>
                            <p className="font-medium text-sm animate-pulse">Loading demo data & running AI models...</p>
                        </div>
                    ) : status === 'success' && !file ? (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex flex-col items-center text-green-600 py-2">
                            <CheckCircle2 className="w-10 h-10 mb-2" />
                            <p className="font-semibold text-sm">Demo Loaded! Redirecting...</p>
                        </motion.div>
                    ) : (
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleDemo}
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl border-2 border-dashed border-primary/40 text-primary font-semibold hover:bg-primary/5 transition-colors disabled:opacity-50"
                        >
                            <Sparkles size={18} />
                            Try with Demo Data (30 students)
                        </motion.button>
                    )}

                    {error && status === 'error' && !file && (
                        <p className="text-red-500 text-sm text-center font-medium mt-3">{error}</p>
                    )}
                </Card>
            </motion.div>

            {/* CSV format guide */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="max-w-2xl mx-auto mt-6 px-4 py-3 bg-slate-100 rounded-xl border border-slate-200 text-slate-500 text-xs"
            >
                <span className="font-semibold text-slate-600">Required CSV columns: </span>
                student_id, name, class, attendance_rate, last_exam_score, exam_score_trend, midday_meal_participation, distance_from_school_km, sibling_dropout_history, family_income_level
            </motion.div>
        </div>
    );
};

export default UploadPage;
