from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
import json
import io
import random
import uuid

app = FastAPI(title="EduGuard API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global in-memory storage
global_students_df = None
risk_results = {}
model = None
feature_names = []

INTERVENTIONS = [
    {"name": "Home Visit", "trigger": "attendance", "description": "Visit the student's home to discuss attendance.", "explanation": "A direct home visit helps understand hidden family constraints preventing the student from attending school regularly, showing the family that the school cares."},
    {"name": "Counselling Session", "trigger": "general", "description": "1-on-1 counseling to address personal or academic stress.", "explanation": "Counseling provides a safe space for the student to express anxieties or academic pressure, which is crucial for emotional stability and preventing disengagement."},
    {"name": "Peer Buddy Assignment", "trigger": "exams", "description": "Pair with a high-performing student for academic support.", "explanation": "Peer learning is highly effective for improving exam scores as students often feel more comfortable asking questions and grasping concepts from their peers."},
    {"name": "Scholarship Assistance", "trigger": "income", "description": "Help applying for financial aid.", "explanation": "Financial constraints are a primary driver of dropout. Securing a scholarship directly removes the economic pressure, allowing the student to focus entirely on education."},
    {"name": "Transportation Support", "trigger": "distance", "description": "Provide a bicycle or bus pass.", "explanation": "Long travel distances cause severe fatigue and frequent absenteeism. Providing transport support immediately resolves the physical barrier to attending school."}
]

SCHEMES = [
    {"name": "Mid-Day Meal Scheme", "eligibility": {"income": ["Low", "Below Poverty Line"]}, "checklist": ["Aadhar Card", "Income Certificate"]},
    {"name": "National Means-cum-Merit Scholarship", "eligibility": {"class": [8, 9, 10, 11, 12], "income": ["Low", "Below Poverty Line"]}, "checklist": ["Income Certificate", "Previous Year Marksheet"]},
    {"name": "Bicycle Scheme", "eligibility": {"distance_min": 3}, "checklist": ["Address Proof", "School ID"]},
    {"name": "Free Uniform Scheme", "eligibility": {"income": ["Low", "Below Poverty Line"]}, "checklist": ["School ID", "Income Certificate"]}
]

@app.post("/upload_students")
async def upload_students(file: UploadFile = File(...)):
    global global_students_df
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files allowed")
    
    contents = await file.read()
    try:
        df = pd.read_csv(io.StringIO(contents.decode('utf-8')))
        global_students_df = df
        return {"message": f"Successfully uploaded {len(df)} student records.", "count": len(df)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error parsing CSV: {str(e)}")

@app.get("/predict_risk")
def predict_risk():
    global global_students_df, risk_results, model, feature_names
    if global_students_df is None or global_students_df.empty:
        raise HTTPException(status_code=400, detail="No student data available. Please upload first.")
    
    df = global_students_df.copy()
    
    # Preprocessing
    categorical_cols = ['exam_score_trend', 'midday_meal_participation', 'sibling_dropout_history', 'family_income_level']
    encoders = {}
    
    df_encoded = df.copy()
    for col in categorical_cols:
        le = LabelEncoder()
        df_encoded[col] = le.fit_transform(df_encoded[col].astype(str))
        encoders[col] = le
        
    features = ['class', 'attendance_rate', 'last_exam_score', 'exam_score_trend', 
                'midday_meal_participation', 'distance_from_school_km', 
                'sibling_dropout_history', 'family_income_level']
    
    X = df_encoded[features]
    feature_names = features
    
    # Generate synthetic labels to train the model on (since we don't have historical dropout data)
    # A realistic heuristic for "dropped_out"
    def synthetic_label(row):
        score = 0
        if row['attendance_rate'] < 60: score += 3
        if row['last_exam_score'] < 40: score += 2
        if row['family_income_level'] in ['Low', 'Below Poverty Line']: score += 1
        if row['distance_from_school_km'] > 6: score += 1
        return 1 if score >= 4 else 0
        
    y = df.apply(synthetic_label, axis=1)
    
    # Train RandomForest
    clf = RandomForestClassifier(n_estimators=100, random_state=42)
    clf.fit(X, y)
    model = clf
    
    # Predict Probability of dropping out (class 1)
    probs = clf.predict_proba(X)
    # If model only predicts 0, handle it
    if probs.shape[1] == 1:
        risk_scores = np.zeros(len(df))
    else:
        risk_scores = probs[:, 1] * 100 # percentage
        
    # Calculate global Feature Importances as a proxy or use tree interpreter for local (simplified to global for this mock)
    importances = clf.feature_importances_
    
    risk_results = {}
    for idx, row in df.iterrows():
        student_id = row['student_id']
        risk_score = round(risk_scores[idx], 1)
        
        if risk_score > 60: risk_level = "High"
        elif risk_score > 30: risk_level = "Medium"
        else: risk_level = "Low"
        
        # Calculate local top factors heuristically matching the importance & value
        factors = []
        if row['attendance_rate'] < 75:
            factors.append({"factor": "Low Attendance", "weight": round(importances[features.index('attendance_rate')]*100, 1), "reason": f"Attendance is significantly low ({row['attendance_rate']}%), missing critical foundational instruction."})
        if row['last_exam_score'] < 50:
            factors.append({"factor": "Low Exam Scores", "weight": round(importances[features.index('last_exam_score')]*100, 1), "reason": f"Recent score of {row['last_exam_score']}% indicates difficulty keeping up with the curriculum."})
        if row['distance_from_school_km'] > 5:
            factors.append({"factor": "Long Travel Distance", "weight": round(importances[features.index('distance_from_school_km')]*100, 1), "reason": f"Traveling {row['distance_from_school_km']} km impacts daily energy levels and consistent attendance."})
        if row['family_income_level'] in ["Low", "Below Poverty Line"]:
            factors.append({"factor": "Financial Constraints", "weight": round(importances[features.index('family_income_level')]*100, 1), "reason": f"Family falls under {row['family_income_level']} income category, adding risk of entering early child labor."})
        if row['sibling_dropout_history'] == "Yes":
            factors.append({"factor": "Sibling Dropout", "weight": round(importances[features.index('sibling_dropout_history')]*100, 1), "reason": "A history of siblings dropping out strongly normalizes leaving school early within the household."})
            
        # fallback based on ranking importances if none triggered
        if not factors:
             top_idx = np.argsort(importances)[::-1][:3]
             for i in top_idx:
                 factors.append({"factor": features[i].replace('_', ' ').title(), "weight": round(importances[i]*100, 1), "reason": "Identified by AI as a primary statistical contributor to risk tier."})
                 
        # sort by weight
        factors = sorted(factors, key=lambda x: x['weight'], reverse=True)[:3]
        
        risk_results[student_id] = {
            "student_id": student_id,
            "name": row['name'],
            "class": row['class'],
            "risk_score": risk_score,
            "risk_level": risk_level,
            "top_factors": factors
        }
    
    return list(risk_results.values())

@app.get("/student/{id}")
def get_student(id: str):
    global global_students_df
    if global_students_df is None or id not in risk_results:
        raise HTTPException(status_code=404, detail="Student not found")
        
    student_data = global_students_df[global_students_df['student_id'] == id].iloc[0].to_dict()
    student_data['risk_profile'] = risk_results[id]
    
    # Mock line chart data for exam performance
    base_score = student_data['last_exam_score']
    trend = student_data['exam_score_trend']
    
    exams = []
    months = ["Jan", "Feb", "Mar", "Apr", "May"]
    current = base_score
    
    for m in reversed(months):
        exams.insert(0, {"month": m, "score": round(current, 1)})
        if trend == "Declining": current += random.uniform(2, 5) # Previous was higher
        elif trend == "Improving": current -= random.uniform(2, 5) # Previous was lower
        else: current += random.uniform(-3, 3) # Stable
        
    student_data['exam_history'] = exams
    return student_data

@app.get("/recommend_interventions/{id}")
def recommend_interventions(id: str):
    if id not in risk_results:
        raise HTTPException(status_code=404, detail="Student not found")
    
    student_risk = risk_results[id]
    factors = [f['factor'].lower() for f in student_risk['top_factors']]
    
    recommended = []
    if any("attendance" in f for f in factors):
        recommended.append(next(i for i in INTERVENTIONS if i['trigger'] == 'attendance'))
    if any("exam" in f for f in factors):
        recommended.append(next(i for i in INTERVENTIONS if i['trigger'] == 'exams'))
    if any("financial" in f for f in factors):
        recommended.append(next(i for i in INTERVENTIONS if i['trigger'] == 'income'))
    if any("distance" in f for f in factors):
        recommended.append(next(i for i in INTERVENTIONS if i['trigger'] == 'distance'))
        
    # Fill up to 3
    for i in INTERVENTIONS:
        if len(recommended) >= 3: break
        if i not in recommended:
            recommended.append(i)
            
    return recommended[:3]

@app.get("/generate_parent_message/{id}")
def generate_parent_message(id: str, lang: str = "english"):
    if global_students_df is None:
        raise HTTPException(status_code=400, detail="No data")

    if id not in risk_results:
        raise HTTPException(status_code=404, detail="Student not found in risk results")

    student = global_students_df[global_students_df['student_id'] == id].iloc[0]
    name = student['name']
    class_num = student['class']
    attendance = round(student['attendance_rate'], 1)
    risk_level = risk_results[id]['risk_level']

    if lang.lower() == "tamil":
        msg = (
            f"அன்பான பெற்றோருக்கு,\n\n"
            f"{name} (வகுப்பு {class_num}) பற்றி உங்களுடன் பேச விரும்புகிறோம். "
            f"இந்த மாதம் அவர்களின் பள்ளி வருகை {attendance}% ஆக உள்ளது. "
            f"இது சிறிது கவலை அளிக்கிறது. "
            f"அவர்களுக்கு சிறந்த ஆதரவு கிடைக்க, "
            f"நாங்கள் உங்களுடன் இணைந்து செயல்பட விரும்புகிறோம். "
            f"வசதியான நேரத்தில் பள்ளியை தொடர்பு கொள்ளவும். நன்றி."
        )
    elif lang.lower() == "hindi":
        msg = (
            f"प्रिय अभिभावक,\n\n"
            f"{name} (कक्षा {class_num}) के बारे में आपसे बात करना चाहते हैं। "
            f"इस महीने उनकी उपस्थिति {attendance}% रही है, "
            f"जो हमें थोड़ी चिंता में डालती है। "
            f"हम चाहते हैं कि {name} अपनी पढ़ाई में आगे बढ़ें और "
            f"इसके लिए हम आपके साथ मिलकर काम करना चाहते हैं। "
            f"कृपया सुविधाजनक समय पर विद्यालय से संपर्क करें। धन्यवाद।"
        )
    else:
        msg = (
            f"Dear Parent / Guardian,\n\n"
            f"I hope this message finds you well. I am reaching out regarding your child "
            f"{name} from Class {class_num}. "
            f"We have noticed that their school attendance this month is {attendance}%, "
            f"and we are a little concerned about their overall progress. "
            f"We deeply care about every student's future here at school, and we would love "
            f"to sit together and talk about how we can support {name} better. "
            f"Please do not feel alarmed — this is simply us reaching out early so we can help. "
            f"Please feel free to contact us at your convenience.\n\nWith warm regards,\nThe School Team"
        )

    return {"message": msg}


@app.get("/generate_volunteer_alert/{id}")
def generate_volunteer_alert(id: str):
    if global_students_df is None:
        raise HTTPException(status_code=400, detail="No data")

    if id not in risk_results:
        raise HTTPException(status_code=404, detail="Student not found in risk results")

    student = global_students_df[global_students_df['student_id'] == id].iloc[0]
    name = student['name']
    class_num = student['class']
    risk_level = risk_results[id]['risk_level']
    factors = ", ".join([f['factor'] for f in risk_results[id]['top_factors'][:2]])

    msg = (
        f"Hello,\n\n"
        f"This is an alert from the EduGuard School System. "
        f"{name} from Class {class_num} has not attended school today and is flagged as a "
        f"{risk_level} dropout risk. "
        f"Key concerns noted: {factors}. "
        f"We would really appreciate if you could visit their home or check in with the family — "
        f"sometimes a friendly visit makes all the difference. "
        f"Please let the school know what you find. Thank you so much for your support."
    )

    return {"message": msg}

@app.get("/match_government_schemes/{id}")
def match_schemes(id: str):
    if global_students_df is None:
        raise HTTPException(status_code=400, detail="No data")
        
    student = global_students_df[global_students_df['student_id'] == id].iloc[0]
    
    eligible = []
    for scheme in SCHEMES:
        is_eligible = True
        reqs = scheme['eligibility']
        
        if 'income' in reqs and student['family_income_level'] not in reqs['income']:
            is_eligible = False
        if 'distance_min' in reqs and student['distance_from_school_km'] < reqs['distance_min']:
            is_eligible = False
        if 'class' in reqs and student['class'] not in reqs['class']:
            is_eligible = False
            
        if is_eligible:
            eligible.append(scheme)
            
    return eligible

@app.get("/get_heatmap_data")
def get_heatmap_data():
    if not risk_results:
        return []
    
    # Mocking districts based on aggregate risk
    # We will simulate 4-5 schools in a district
    schools = [
         {"id": 1, "name": "Govt High School, North Zone", "lat": 13.0827, "lng": 80.2707},
         {"id": 2, "name": "Panchayat Union School, South", "lat": 13.0012, "lng": 80.2565},
         {"id": 3, "name": "Municipal Boys School", "lat": 13.1143, "lng": 80.2115},
         {"id": 4, "name": "Anna Girls School", "lat": 13.0654, "lng": 80.2341},
    ]
    
    for s in schools:
         num_students = random.randint(30, 80)
         avg_risk = random.uniform(20.0, 75.0)
         if avg_risk > 60: risk_level = "High"
         elif avg_risk > 30: risk_level = "Medium"
         else: risk_level = "Low"
         
         s["student_count"] = num_students
         s["avg_risk_score"] = round(avg_risk, 1)
         s["risk_level"] = risk_level
         
    return schools

@app.get("/load_demo_data")
def load_demo_data():
    """Generate synthetic student data and run risk prediction without file upload."""
    global global_students_df

    NAMES = [
        "Aarav Kumar", "Priya Sharma", "Ravi Patel", "Sunita Devi", "Mohan Das",
        "Lakshmi Nair", "Arjun Singh", "Meena Iyer", "Suresh Pillai", "Kavitha Raj",
        "Dinesh Babu", "Ananya Krishnan", "Raj Malhotra", "Pooja Gupta", "Vikram Reddy",
        "Sita Murali", "Karan Joshi", "Divya Menon", "Amit Yadav", "Rekha Bose",
        "Nikhil Verma", "Deepa Nambiar", "Venkat Raman", "Shruti Tiwari", "Ganesh Rao",
        "Radha Krishnan", "Sanjay Mishra", "Usha Bhatt", "Tarun Kapoor", "Lalitha Devi"
    ]

    rows = []
    for i, name in enumerate(NAMES):
        student_id = f"DEMO{i+1:03d}"
        rows.append({
            "student_id": student_id,
            "name": name,
            "class": random.randint(6, 10),
            "attendance_rate": round(random.uniform(45, 98), 1),
            "last_exam_score": round(random.uniform(25, 95), 1),
            "exam_score_trend": random.choice(["Declining", "Stable", "Improving", "Declining"]),
            "midday_meal_participation": random.choice(["Yes", "No", "Yes", "Yes"]),
            "distance_from_school_km": round(random.uniform(0.5, 12.0), 1),
            "sibling_dropout_history": random.choice(["No", "No", "Yes", "No"]),
            "family_income_level": random.choice(["Low", "Middle", "Below Poverty Line", "Middle", "Low"])
        })

    global_students_df = pd.DataFrame(rows)

    # Run prediction pipeline directly
    df = global_students_df.copy()
    categorical_cols = ['exam_score_trend', 'midday_meal_participation', 'sibling_dropout_history', 'family_income_level']
    df_encoded = df.copy()
    for col in categorical_cols:
        le = LabelEncoder()
        df_encoded[col] = le.fit_transform(df_encoded[col].astype(str))

    features = ['class', 'attendance_rate', 'last_exam_score', 'exam_score_trend',
                'midday_meal_participation', 'distance_from_school_km',
                'sibling_dropout_history', 'family_income_level']
    X = df_encoded[features]

    def synthetic_label(row):
        score = 0
        if row['attendance_rate'] < 60: score += 3
        if row['last_exam_score'] < 40: score += 2
        if row['family_income_level'] in ['Low', 'Below Poverty Line']: score += 1
        if row['distance_from_school_km'] > 6: score += 1
        return 1 if score >= 4 else 0

    y = df.apply(synthetic_label, axis=1)
    clf = RandomForestClassifier(n_estimators=100, random_state=42)
    clf.fit(X, y)

    global model, feature_names, risk_results
    model = clf
    feature_names = features

    probs = clf.predict_proba(X)
    risk_scores = probs[:, 1] * 100 if probs.shape[1] > 1 else np.zeros(len(df))
    importances = clf.feature_importances_

    risk_results = {}
    for idx, row in df.iterrows():
        sid = row['student_id']
        risk_score = round(risk_scores[idx], 1)
        risk_level = "High" if risk_score > 60 else ("Medium" if risk_score > 30 else "Low")

        factors = []
        if row['attendance_rate'] < 75:
            factors.append({"factor": "Low Attendance", "weight": round(importances[features.index('attendance_rate')]*100, 1), "reason": f"Attendance is significantly low ({row['attendance_rate']}%), missing critical foundational instruction."})
        if row['last_exam_score'] < 50:
            factors.append({"factor": "Low Exam Scores", "weight": round(importances[features.index('last_exam_score')]*100, 1), "reason": f"Recent score of {row['last_exam_score']}% indicates difficulty keeping up with the curriculum."})
        if row['distance_from_school_km'] > 5:
            factors.append({"factor": "Long Travel Distance", "weight": round(importances[features.index('distance_from_school_km')]*100, 1), "reason": f"Traveling {row['distance_from_school_km']} km impacts daily energy levels and consistent attendance."})
        if row['family_income_level'] in ["Low", "Below Poverty Line"]:
            factors.append({"factor": "Financial Constraints", "weight": round(importances[features.index('family_income_level')]*100, 1), "reason": f"Family falls under {row['family_income_level']} income category, adding risk of entering early child labor."})
        if row['sibling_dropout_history'] == "Yes":
            factors.append({"factor": "Sibling Dropout", "weight": round(importances[features.index('sibling_dropout_history')]*100, 1), "reason": "A history of siblings dropping out strongly normalizes leaving school early within the household."})

        if not factors:
            top_idx = np.argsort(importances)[::-1][:3]
            for i in top_idx:
                factors.append({"factor": features[i].replace('_', ' ').title(), "weight": round(importances[i]*100, 1), "reason": "Identified by AI as a primary statistical contributor to risk tier."})

        factors = sorted(factors, key=lambda x: x['weight'], reverse=True)[:3]
        risk_results[sid] = {
            "student_id": sid,
            "name": row['name'],
            "class": row['class'],
            "risk_score": risk_score,
            "risk_level": risk_level,
            "top_factors": factors
        }

    return {"message": f"Demo data loaded with {len(df)} students.", "count": len(df)}


@app.post("/log_intervention")
def log_intervention(intervention: dict):
    # Dummy logging
    return {"message": "Intervention logged successfully", "data": intervention}

@app.get("/intervention_outcome/{id}")
def intervention_outcome(id: str):
    # Return mock comparison data for multiple metrics
    return {
        "student_id": id,
        "days_tracked": 30,
        "metrics": [
            {
                "name": "Attendance %",
                "before": round(random.uniform(40, 60), 1),
                "after": round(random.uniform(70, 95), 1)
            },
            {
                "name": "Class Engagement / 10",
                "before": round(random.uniform(3, 5), 1),
                "after": round(random.uniform(6, 9), 1)
            },
            {
                "name": "Risk Score %",
                "before": round(random.uniform(65, 90), 1),
                "after": round(random.uniform(30, 50), 1)
            }
        ]
    }

import os

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", 8000)))