import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { getHeatmapDataAPI } from '../services/api';
import Card from '../components/Card';
import { motion } from 'framer-motion';
import { Users, AlertTriangle, Building2, TrendingUp } from 'lucide-react';

const HeatmapPage = () => {
    const [schools, setSchools] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getHeatmapDataAPI();
                setSchools(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const getColor = (risk) => {
        if (risk === "High") return "#EF4444"; // Red
        if (risk === "Medium") return "#F59E0B"; // Yellow/Amber
        return "#22C55E"; // Green
    };

    const totalStudents = schools.reduce((acc, s) => acc + s.student_count, 0);
    const highRiskSchools = schools.filter(s => s.risk_level === 'High').length;
    const avgDistrictRisk = schools.length ? Math.round(schools.reduce((acc, s) => acc + s.avg_risk_score, 0) / schools.length) : 0;

    return (
        <div className="max-w-7xl mx-auto px-6 pb-12 flex flex-col min-h-[calc(100vh-80px)]">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">District Risk Heatmap</h1>
                <p className="text-slate-500 text-sm mt-1">Geographic distribution of aggregated at-risk student populations.</p>
            </div>

            {/* District Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                    { icon: <Building2 size={20} />, label: 'Total Schools', value: schools.length, color: 'blue' },
                    { icon: <Users size={20} />, label: 'Monitored Students', value: totalStudents, color: 'indigo' },
                    { icon: <TrendingUp size={20} />, label: 'Avg District Risk', value: `${avgDistrictRisk}%`, color: 'orange' },
                    { icon: <AlertTriangle size={20} />, label: 'Critical Schools', value: highRiskSchools, color: 'red' },
                ].map(({ icon, label, value, color }, i) => (
                    <motion.div key={label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.1 }}>
                        <Card className="flex items-center gap-4 p-4">
                            <div className={`p-2.5 bg-${color}-100 text-${color}-600 rounded-xl`}>{icon}</div>
                            <div>
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
                                <h3 className="text-xl font-bold text-slate-800 leading-tight">{value}</h3>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <Card className="flex-1 p-0 overflow-hidden relative shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-slate-200/60 rounded-2xl min-h-[500px]">
                {loading && (
                    <div className="absolute inset-0 z-[1000] bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center">
                        <div className="flex items-center gap-2 mb-3">
                            <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} className="w-3 h-3 rounded-full bg-primary" />
                            <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} className="w-3 h-3 rounded-full bg-primary" />
                            <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }} className="w-3 h-3 rounded-full bg-primary" />
                        </div>
                        <p className="text-slate-500 font-medium text-sm">Loading District Data...</p>
                    </div>
                )}
                {/* Default coordinates centered around Chennai roughly for mock data */}
                <MapContainer center={[13.0827, 80.2707]} zoom={11} scrollWheelZoom={true} style={{ height: "500px", width: "100%" }} className="z-0 transition-opacity duration-500 relative">
                    <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                    />

                    {schools.map((school) => (
                        <CircleMarker
                            key={school.id}
                            center={[school.lat, school.lng]}
                            radius={Math.max(8, school.student_count / 1.5)} // Better scaling
                            fillColor={getColor(school.risk_level)}
                            color="#ffffff"
                            weight={2}
                            opacity={1}
                            fillOpacity={0.8}
                            className="transition-all duration-300 pointer-events-auto cursor-pointer"
                        >
                            <Tooltip direction="top" offset={[0, -10]} opacity={1} className="!bg-white !text-slate-800 !border-0 !shadow-xl !rounded-xl !p-0">
                                <div className="p-3 min-w-[150px]">
                                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-100">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getColor(school.risk_level) }} />
                                        <h3 className="font-bold text-slate-800 text-sm leading-tight">{school.name}</h3>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs text-slate-500 flex justify-between font-medium">Students <span className="text-slate-800 font-bold">{school.student_count}</span></p>
                                        <p className="text-xs text-slate-500 flex justify-between font-medium">Risk Score <span className="text-slate-800 font-bold">{school.avg_risk_score}%</span></p>
                                    </div>
                                </div>
                            </Tooltip>
                        </CircleMarker>
                    ))}
                </MapContainer>
            </Card>
        </div>
    );
};

export default HeatmapPage;
