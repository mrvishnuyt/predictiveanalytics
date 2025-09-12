import pandas as pd
from flask import Flask, jsonify, request
from flask_cors import CORS
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
import numpy as np
import json
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required, JWTManager
import os

# Initialize Flask App and add JWT
app = Flask(__name__)
app.config["JWT_SECRET_KEY"] = "your-super-secret-key-change-me"  # Change this!
jwt = JWTManager(app)
CORS(app)

# --- User Data Management ---
USERS_FILE = 'users.json'

def load_users():
    if not os.path.exists(USERS_FILE):
        return {}
    with open(USERS_FILE, 'r') as f:
        return json.load(f)

def save_users(users):
    with open(USERS_FILE, 'w') as f:
        json.dump(users, f, indent=4)

# --- Data Loading and Machine Learning Model Training ---
df = pd.read_csv('online_course_engagement_data.csv')
features = ['TimeSpentOnCourse', 'QuizScores', 'CompletionRate']
target = 'CourseCompletion'
df.dropna(subset=features, inplace=True)

X = df[features]
y = df[target]

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
model = LogisticRegression(random_state=42)
model.fit(X_train_scaled, y_train)

def predict_engagement(data):
    data_df = pd.DataFrame(data)
    if data_df.empty or not all(f in data_df.columns for f in features):
        return []
    scaled_data = scaler.transform(data_df[features])
    probabilities = model.predict_proba(scaled_data)[:, 1] 
    
    def categorize(prob):
        if prob > 0.75: return 'High'
        elif prob > 0.4: return 'Medium'
        else: return 'Low'
            
    return [categorize(p) for p in probabilities]

df['PredictedEngagement'] = predict_engagement(df)

# --- NEW Authentication API Endpoints ---

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    users = load_users()

    if not username or not password:
        return jsonify({"msg": "Username and password required"}), 400
    if username in users:
        return jsonify({"msg": "Username already exists"}), 409

    hashed_password = generate_password_hash(password)
    users[username] = {"password": hashed_password, "email": f"{username}@example.com"} # Add more fields as needed
    save_users(users)
    return jsonify({"msg": "User created successfully"}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    users = load_users()

    if not username or not password:
        return jsonify({"msg": "Username and password required"}), 400
        
    user = users.get(username)
    if user and check_password_hash(user['password'], password):
        access_token = create_access_token(identity=username)
        return jsonify(access_token=access_token)
    
    return jsonify({"msg": "Bad username or password"}), 401

@app.route('/api/profile', methods=['GET', 'PUT'])
@jwt_required()
def profile():
    current_user = get_jwt_identity()
    users = load_users()
    user_data = users.get(current_user)

    if not user_data:
        return jsonify({"msg": "User not found"}), 404

    if request.method == 'PUT':
        data = request.get_json()
        if 'email' in data:
            user_data['email'] = data['email']
        if 'password' in data and data['password']:
            user_data['password'] = generate_password_hash(data['password'])
        
        users[current_user] = user_data
        save_users(users)
        return jsonify({"msg": "Profile updated successfully"})

    # On GET request
    return jsonify(username=current_user, email=user_data.get('email', ''))


# --- Existing Data API Endpoints (now protected) ---

@app.route('/api/students')
@jwt_required()
def get_students():
    # ... (code is the same, just added @jwt_required())
    students_df = df.rename(columns={'UserID': 'id', 'CourseName': 'course', 'CompletionRate': 'progress', 'QuizScores': 'score', 'TimeSpentOnCourse': 'timeSpent'})
    for col in ['progress', 'score', 'timeSpent']:
        students_df[col] = students_df[col].round(2)
    return jsonify(students_df.to_dict(orient='records'))

@app.route('/api/dashboard_stats')
@jwt_required()
def get_dashboard_stats():
    # ... (code is the same, just added @jwt_required())
    engagement_counts = df['PredictedEngagement'].value_counts()
    completion_counts = df['CourseCompletion'].value_counts()
    avg_scores = df.groupby('CourseName')['QuizScores'].mean().round(2)
    avg_time = df.groupby('CourseName')['TimeSpentOnCourse'].mean().round(2)
    score_bins = pd.cut(df['QuizScores'], bins=[0, 20, 40, 60, 80, 100], labels=['0-20', '21-40', '41-60', '61-80', '81-100'], right=True, include_lowest=True)
    score_dist = score_bins.value_counts().sort_index()
    students_per_course = df['CourseName'].value_counts()
    return jsonify({
        'engagement': {'labels': engagement_counts.index.tolist(), 'values': [int(v) for v in engagement_counts.values]},
        'completion': {'labels': ['Completed', 'In Progress'], 'values': [int(completion_counts.get(1, 0)), int(completion_counts.get(0, 0))]},
        'averageScores': {'labels': avg_scores.index.tolist(), 'values': avg_scores.values.tolist()},
        'averageTime': {'labels': avg_time.index.tolist(), 'values': avg_time.values.tolist()},
        'scoreDistribution': {'labels': score_dist.index.tolist(), 'values': [int(v) for v in score_dist.values]},
        'studentsPerCourse': {'labels': students_per_course.index.tolist(), 'values': [int(v) for v in students_per_course.values]}
    })
    
@app.route('/api/courses')
@jwt_required()
def get_courses():
    # ... (code is the same, just added @jwt_required())
    courses_agg = df.groupby('CourseName').agg(students=('UserID', 'count'), avgProgress=('CompletionRate', 'mean')).round(2).reset_index()
    colors = ['border-sky-500', 'border-emerald-500', 'border-amber-500', 'border-violet-500']
    courses_agg['color'] = [colors[i % len(colors)] for i in range(len(courses_agg))]
    courses_agg = courses_agg.rename(columns={'CourseName': 'title'})
    return jsonify(courses_agg.to_dict(orient='records'))

@app.route('/api/courses/<path:course_name>')
@jwt_required()
def get_course_details(course_name):
    # ... (code is the same, just added @jwt_required())
    course_students_df = df[df['CourseName'] == course_name].copy()
    if course_students_df.empty:
        return jsonify({"error": "Course not found"}), 404
    course_students_df.rename(columns={'UserID': 'id', 'CourseName': 'course', 'CompletionRate': 'progress', 'QuizScores': 'score', 'TimeSpentOnCourse': 'timeSpent'}, inplace=True)
    return jsonify(course_students_df.to_dict(orient='records'))

@app.route('/api/search')
@jwt_required()
def search():
    # ... (code is the same, just added @jwt_required())
    query = request.args.get('q', '').lower()
    if not query:
        return jsonify([])
    mask = df['UserID'].astype(str).str.contains(query, case=False) | df['CourseName'].str.contains(query, case=False)
    results_df = df[mask].copy()
    if not results_df.empty:
        results_df['PredictedEngagement'] = predict_engagement(results_df)
    results_df.rename(columns={'UserID': 'id', 'CourseName': 'course', 'CompletionRate': 'progress', 'QuizScores': 'score', 'TimeSpentOnCourse': 'timeSpent'}, inplace=True)
    return jsonify(results_df.to_dict(orient='records'))

# --- Main execution ---
if __name__ == '__main__':
    app.run(debug=True)
