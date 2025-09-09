import pandas as pd
from flask import Flask, jsonify, request
from flask_cors import CORS
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
import numpy as np

# Initialize Flask App and CORS
app = Flask(__name__)
CORS(app)

# --- Data Loading and Machine Learning Model Training ---
df = pd.read_csv('online_course_engagement_data.csv')
features = ['TimeSpentOnCourse', 'QuizScores', 'CompletionRate']
target = 'CourseCompletion'
# Drop rows with missing values in key columns to prevent errors
df.dropna(subset=features, inplace=True)

X = df[features]
y = df[target]

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
model = LogisticRegression(random_state=42)
model.fit(X_train_scaled, y_train)

# --- Prediction Function ---
def predict_engagement(data):
    # Ensure data is a DataFrame, not a Series, for single-row predictions
    data_df = pd.DataFrame(data)
    if data_df.empty:
        return []
    scaled_data = scaler.transform(data_df[features])
    probabilities = model.predict_proba(scaled_data)[:, 1] 
    
    def categorize(prob):
        if prob > 0.75: return 'High'
        elif prob > 0.4: return 'Medium'
        else: return 'Low'
            
    return [categorize(p) for p in probabilities]

df['PredictedEngagement'] = predict_engagement(df)

# --- API Endpoints ---

@app.route('/api/students')
def get_students():
    students_df = df.rename(columns={
        'UserID': 'id', 'CourseName': 'course', 'CompletionRate': 'progress',
        'QuizScores': 'score', 'TimeSpentOnCourse': 'timeSpent'
    })
    for col in ['progress', 'score', 'timeSpent']:
        students_df[col] = students_df[col].round(2)
    return jsonify(students_df.to_dict(orient='records'))

@app.route('/api/dashboard_stats')
def get_dashboard_stats():
    engagement_counts = df['PredictedEngagement'].value_counts()
    completion_counts = df['CourseCompletion'].value_counts()
    avg_scores = df.groupby('CourseName')['QuizScores'].mean().round(2)
    avg_time = df.groupby('CourseName')['TimeSpentOnCourse'].mean().round(2)
    
    return jsonify({
        'engagement': {'labels': engagement_counts.index.tolist(), 'values': [int(v) for v in engagement_counts.values]},
        'completion': {'labels': ['Completed', 'In Progress'], 'values': [int(completion_counts.get(1, 0)), int(completion_counts.get(0, 0))]},
        'averageScores': {'labels': avg_scores.index.tolist(), 'values': avg_scores.values.tolist()},
        'averageTime': {'labels': avg_time.index.tolist(), 'values': avg_time.values.tolist()}
    })
    
@app.route('/api/courses')
def get_courses():
    courses_agg = df.groupby('CourseName').agg(students=('UserID', 'count'), avgProgress=('CompletionRate', 'mean')).round(2).reset_index()
    colors = ['border-sky-500', 'border-emerald-500', 'border-amber-500', 'border-violet-500']
    courses_agg['color'] = [colors[i % len(colors)] for i in range(len(courses_agg))]
    courses_agg = courses_agg.rename(columns={'CourseName': 'title'})
    return jsonify(courses_agg.to_dict(orient='records'))

@app.route('/api/courses/<path:course_name>')
def get_course_details(course_name):
    """Returns all students registered for a specific course."""
    
    course_students_df = df[df['CourseName'] == course_name].copy()

    if course_students_df.empty:
        return jsonify({"error": "Course not found"}), 404

    # Rename columns to match the frontend StudentTable component's expectations
    course_students_df.rename(columns={
        'UserID': 'id',
        'CourseName': 'course',
        'CompletionRate': 'progress',
        'QuizScores': 'score',
        'TimeSpentOnCourse': 'timeSpent'
    }, inplace=True)

    return jsonify(course_students_df.to_dict(orient='records'))

@app.route('/api/search')
def search():
    query = request.args.get('q', '').lower()
    if not query:
        return jsonify([])

    # Ensure UserID is treated as a string for searching
    mask = df['UserID'].astype(str).str.contains(query, case=False) | \
           df['CourseName'].str.contains(query, case=False)
           
    results_df = df[mask].copy()

    # The prediction is already on the main df, so no need to re-calculate
    # We just need to rename columns for consistency
    results_df.rename(columns={
        'UserID': 'id', 'CourseName': 'course', 'CompletionRate': 'progress',
        'QuizScores': 'score', 'TimeSpentOnCourse': 'timeSpent'
    }, inplace=True)

    return jsonify(results_df.to_dict(orient='records'))


# --- Main execution ---
if __name__ == '__main__':
    app.run(debug=True)

