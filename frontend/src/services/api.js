const API_URL = "http://localhost:8000";

export const uploadStudentsAPI = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${API_URL}/upload_students`, {
        method: "POST",
        body: formData,
    });
    if (!res.ok) throw new Error("Upload failed");
    return res.json();
};

export const predictRiskAPI = async () => {
    const res = await fetch(`${API_URL}/predict_risk`);
    if (!res.ok) throw new Error("Prediction failed");
    return res.json();
};

export const getStudentAPI = async (id) => {
    const res = await fetch(`${API_URL}/student/${id}`);
    if (!res.ok) throw new Error("Fetch failed");
    return res.json();
};

export const recommendInterventionsAPI = async (id) => {
    const res = await fetch(`${API_URL}/recommend_interventions/${id}`);
    if (!res.ok) throw new Error("Fetch failed");
    return res.json();
};

export const generateParentMessageAPI = async (id, lang = "english") => {
    const res = await fetch(`${API_URL}/generate_parent_message/${id}?lang=${lang}`);
    if (!res.ok) throw new Error("Generation failed");
    return res.json();
};

export const generateVolunteerMessageAPI = async (id) => {
    const res = await fetch(`${API_URL}/generate_volunteer_alert/${id}`);
    if (!res.ok) throw new Error("Volunteer generation failed");
    return res.json();
};

export const matchSchemesAPI = async (id) => {
    const res = await fetch(`${API_URL}/match_government_schemes/${id}`);
    if (!res.ok) throw new Error("Match failed");
    return res.json();
};

export const getHeatmapDataAPI = async () => {
    const res = await fetch(`${API_URL}/get_heatmap_data`);
    if (!res.ok) throw new Error("Fetch heatmap failed");
    return res.json();
};

export const logInterventionAPI = async (data) => {
    const res = await fetch(`${API_URL}/log_intervention`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Log failed");
    return res.json();
};

export const interventionOutcomeAPI = async (id) => {
    const res = await fetch(`${API_URL}/intervention_outcome/${id}`);
    if (!res.ok) throw new Error("Fetch failed");
    return res.json();
};

export const loadDemoDataAPI = async () => {
    const res = await fetch(`${API_URL}/load_demo_data`);
    if (!res.ok) throw new Error("Demo load failed");
    return res.json();
};
