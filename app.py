import pandas as pd
from flask import Flask, jsonify, request
from flask_cors import CORS
import json
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required, JWTManager
import os
import joblib
import firebase_admin
from firebase_admin import credentials, firestore

# --- Firebase Initialization ---
# IMPORTANT: In Vercel, create a single Environment Variable named FIREBASE_SERVICE_ACCOUNT_KEY
# and paste the entire content of your JSON credentials file as its value.
try:
    # Vercel stores the JSON content as a string, so we need to load it
    service_account_info = json.loads(os.environ.get("FIREBASE_SERVICE_ACCOUNT_KEY"))
    cred = credentials.Certificate(service_account_info)
    firebase_admin.initialize_app(cred)
    db = firestore.client()
    users_collection = db.collection('users')
    print("Firebase initialized successfully.")
except Exception as e:
    print(f"Firebase initialization failed: {e}")
    db = None
    users_collection = None

# Initialize Flask App and add JWT
app = Flask(__name__)
app.config["JWT_SECRET_KEY"] = os.environ.get("JWT_SECRET_KEY", "your-fallback-secret-key-for-local-dev")
jwt = JWTManager(app)
CORS(app)

# --- Load Pre-trained Model and Scaler ---
scaler = joblib.load('scaler.joblib')
model = joblib.load('model.joblib')

# --- Data Loading and Predictions ---
df = pd.read_csv('online_course_engagement_data.csv')
features = ['TimeSpentOnCourse', 'QuizScores', 'CompletionRate']
df.dropna(subset=features, inplace=True)

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


# --- Authentication API Endpoints (Updated for Firebase) ---

@app.route('/api/register', methods=['POST'])
def register():
    if not users_collection:
        return jsonify({"msg": "Database not configured properly on the server"}), 500
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"msg": "Username and password required"}), 400
    
    user_doc = users_collection.document(username).get()
    if user_doc.exists:
        return jsonify({"msg": "Username already exists"}), 409

    hashed_password = generate_password_hash(password)
    user_data = {"password": hashed_password, "email": f"{username}@example.com"}
    users_collection.document(username).set(user_data)
    return jsonify({"msg": "User created successfully"}), 201

@app.route('/api/login', methods=['POST'])
def login():
    if not users_collection:
        return jsonify({"msg": "Database not configured properly on the server"}), 500
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"msg": "Username and password required"}), 400
        
    user_doc = users_collection.document(username).get()
    if user_doc.exists and check_password_hash(user_doc.to_dict()['password'], password):
        access_token = create_access_token(identity=username)
        return jsonify(access_token=access_token)
    
    return jsonify({"msg": "Bad username or password"}), 401

@app.route('/api/profile', methods=['GET', 'PUT'])
@jwt_required()
def profile():
    if not users_collection:
        return jsonify({"msg": "Database not configured"}), 500
    current_user = get_jwt_identity()
    user_ref = users_collection.document(current_user)
    
    if request.method == 'PUT':
        data = request.get_json()
        update_data = {}
        if 'email' in data:
            update_data['email'] = data['email']
        if 'password' in data and data['password']:
            update_data['password'] = generate_password_hash(data['password'])
        
        if update_data:
            user_ref.update(update_data)
        return jsonify({"msg": "Profile updated successfully"})

    # On GET request
    user_doc = user_ref.get()
    if not user_doc.exists:
        return jsonify({"msg": "User not found"}), 404
    user_data = user_doc.to_dict()
    return jsonify(username=current_user, email=user_data.get('email', ''))


# --- Data API Endpoints (Unchanged) ---
@app.route('/api/students')
@jwt_required()
def get_students():
    students_df = df.rename(columns={'UserID': 'id', 'CourseName': 'course', 'CompletionRate': 'progress', 'QuizScores': 'score', 'TimeSpentOnCourse': 'timeSpent'})
    for col in ['progress', 'score', 'timeSpent']:
        students_df[col] = students_df[col].round(2)
    return jsonify(students_df.to_dict(orient='records'))

@app.route('/api/dashboard_stats')
@jwt_required()
def get_dashboard_stats():
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
    courses_agg = df.groupby('CourseName').agg(students=('UserID', 'count'), avgProgress=('CompletionRate', 'mean')).round(2).reset_index()
    colors = ['border-violet-500', 'border-sky-500', 'border-emerald-500', 'border-amber-500']
    courses_agg['color'] = [colors[i % len(colors)] for i in range(len(courses_agg))]
    courses_agg = courses_agg.rename(columns={'CourseName': 'title'})
    return jsonify(courses_agg.to_dict(orient='records'))

@app.route('/api/courses/<path:course_name>')
@jwt_required()
def get_course_details(course_name):
    course_students_df = df[df['CourseName'] == course_name].copy()
    if course_students_df.empty:
        return jsonify({"error": "Course not found"}), 404
    course_students_df.rename(columns={'UserID': 'id', 'CourseName': 'course', 'CompletionRate': 'progress', 'QuizScores': 'score', 'TimeSpentOnCourse': 'timeSpent'}, inplace=True)
    return jsonify(course_students_df.to_dict(orient='records'))

@app.route('/api/search')
@jwt_required()
def search():
    query = request.args.get('q', '').lower()
    if not query:
        return jsonify([])
    mask = df['UserID'].astype(str).str.lower().str.contains(query) | df['CourseName'].str.lower().str.contains(query)
    results_df = df[mask].copy()
    if not results_df.empty:
        results_df['PredictedEngagement'] = predict_engagement(results_df)
    results_df.rename(columns={'UserID': 'id', 'CourseName': 'course', 'CompletionRate': 'progress', 'QuizScores': 'score', 'TimeSpentOnCourse': 'timeSpent'}, inplace=True)
    return jsonify(results_df.to_dict(orient='records'))

