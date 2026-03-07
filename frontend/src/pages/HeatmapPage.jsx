import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
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
        if (risk === "High") return "#ef4444"; // red-500
        if (risk === "Medium") return "#f97316"; // orange-500
        return "#22c55e"; // green-500
    };

    return (
        <div className="max-w-7xl mx-auto px-6 h-[calc(100vh-140px)] flex flex-col">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">District Risk Heatmap</h1>
                <p className="text-slate-500 text-sm mt-1">Geographic distribution of aggregated at-risk student populations.</p>
            </div>

            <Card className="flex-1 p-0 overflow-hidden relative shadow-md border-0">
                {loading && (
                    <div className="absolute inset-0 z-[1000] bg-white/80 backdrop-blur-sm flex items-center justify-center">
                        <p className="font-medium text-slate-500">Loading map data...</p>
                    </div>
                )}
                {/* Default coordinates centered around Chennai roughly for mock data */}
                <MapContainer center={[13.0827, 80.2707]} zoom={11} scrollWheelZoom={false} className="w-full h-full">
                    <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    />

                    {schools.map((school) => (
                        <CircleMarker
                            key={school.id}
                            center={[school.lat, school.lng]}
                            radius={school.student_count / 2} // Scale radius based on students
                            fillColor={getColor(school.risk_level)}
                            color="white"
                            weight={2}
                            opacity={1}
                            fillOpacity={0.7}
                        >
                            <Popup>
                                <div className="p-1">
                                    <h3 className="font-semibold text-slate-800 mb-1">{school.name}</h3>
                                    <p className="text-sm text-slate-600">Students: <span className="font-medium">{school.student_count}</span></p>
                                    <p className="text-sm text-slate-600">Avg Risk: <span className="font-medium">{school.avg_risk_score}% ({school.risk_level})</span></p>
                                </div>
                            </Popup>
                        </CircleMarker>
                    ))}
                </MapContainer>
            </Card>
        </div>
    );
};

export default HeatmapPage;
