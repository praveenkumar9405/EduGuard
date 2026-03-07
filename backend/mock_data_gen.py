import pandas as pd
import numpy as np
import random
import os

def generate_mock_data(num_students=200):
   np.random.seed(42)
   random.seed(42)

   # Names
   first_names = [
       "Aditya", "Aarav", "Priya", "Meena", "Ravi", "Kavya", "Suresh", "Lakshmi",
       "Vikram", "Sneha", "Karan", "Pooja", "Arjun", "Ananya", "Rahul", "Nisha",
       "Rohit", "Divya", "Amit", "Shruti", "Sandeep", "Swati", "Manoj", "Kiran"
   ]
   last_names = [
       "Sharma", "Patel", "Kumar", "Singh", "Reddy", "Rao", "Das", "Yadav",
       "Gupta", "Nair", "Iyer", "Joshi", "Chauhan", "Mehta", "Bose", "Verma",
       "Pandey", "Chowdhury", "Mishra", "Tiwari", "Agarwal"
   ]

   data = []
   for i in range(1, num_students + 1):
       name = f"{random.choice(first_names)} {random.choice(last_names)}"
       
       # Demographics
       student_class = random.choice([8, 9, 10, 11, 12])
       
       # Strong correlation between attendance, exams, and income for risk
       base_risk = random.random()
       
       # High risk profile
       if base_risk > 0.8:
           attendance_rate = round(random.uniform(40.0, 70.0), 1)
           last_exam_score = round(random.uniform(30.0, 50.0), 1)
           exam_score_trend = "Declining"
           family_income_level = random.choice(["Low", "Below Poverty Line"])
           distance = round(random.uniform(5.0, 12.0), 1)
           sibling_dropout = random.choice(["Yes", "No", "No"]) # 33% chance
           midday_meal = "Irregular"
           
       # Medium risk profile
       elif base_risk > 0.5:
           attendance_rate = round(random.uniform(65.0, 85.0), 1)
           last_exam_score = round(random.uniform(45.0, 70.0), 1)
           exam_score_trend = random.choice(["Stable", "Declining", "Improving"])
           family_income_level = random.choice(["Low", "Medium"])
           distance = round(random.uniform(2.0, 8.0), 1)
           sibling_dropout = random.choice(["Yes", "No", "No", "No", "No"]) # 20% chance
           midday_meal = random.choice(["Regular", "Irregular"])
           
       # Low risk profile
       else:
           attendance_rate = round(random.uniform(85.0, 100.0), 1)
           last_exam_score = round(random.uniform(65.0, 95.0), 1)
           exam_score_trend = random.choice(["Improving", "Stable"])
           family_income_level = random.choice(["Medium", "High"])
           distance = round(random.uniform(0.5, 5.0), 1)
           sibling_dropout = "No"
           midday_meal = "Regular"
           
       # Introduce some random noise
       if random.random() < 0.05:
           exam_score_trend = "Fluctuating"
           
       data.append({
           "student_id": f"STU{i:04d}",
           "name": name,
           "class": student_class,
           "attendance_rate": attendance_rate,
           "last_exam_score": last_exam_score,
           "exam_score_trend": exam_score_trend,
           "midday_meal_participation": midday_meal,
           "distance_from_school_km": distance,
           "sibling_dropout_history": sibling_dropout,
           "family_income_level": family_income_level
       })

   df = pd.DataFrame(data)
   
   os.makedirs("data", exist_ok=True)
   df.to_csv("data/students_mock.csv", index=False)
   print(f"Generated {num_students} mock students at data/students_mock.csv")

if __name__ == "__main__":
   generate_mock_data()
