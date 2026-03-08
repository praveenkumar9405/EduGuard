import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { getHeatmapDataAPI } from '../services/api';
import Card from '../components/Card';

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

    return (
        <div className="max-w-7xl mx-auto px-6 h-[calc(100vh-140px)] flex flex-col">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">District Risk Heatmap</h1>
                <p className="text-slate-500 text-sm mt-1">Geographic distribution of aggregated at-risk student populations.</p>
            </div>

            <Card className="flex-1 p-0 overflow-hidden relative shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-slate-200/60 rounded-2xl">
                {loading && (
                    <div className="absolute inset-0 z-[1000] bg-white/80 backdrop-blur-sm flex items-center justify-center">
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                )}
                {/* Default coordinates centered around Chennai roughly for mock data */}
                <MapContainer center={[13.0827, 80.2707]} zoom={11} scrollWheelZoom={true} className="w-full h-full z-0 transition-opacity duration-500">
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
