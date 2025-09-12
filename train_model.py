import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
import joblib

# Load the dataset
print("Loading data...")
df = pd.read_csv('online_course_engagement_data.csv')

# Define features and target
features = ['TimeSpentOnCourse', 'QuizScores', 'CompletionRate']
target = 'CourseCompletion'
df.dropna(subset=features, inplace=True)

X = df[features]
y = df[target]

# Split data for training
X_train, _, y_train, _ = train_test_split(X, y, test_size=0.2, random_state=42)

# Create and train the scaler
print("Training scaler...")
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
joblib.dump(scaler, 'scaler.joblib')
print("Scaler saved to scaler.joblib")

# Create and train the model
print("Training model...")
model = LogisticRegression(random_state=42)
model.fit(X_train_scaled, y_train)
joblib.dump(model, 'model.joblib')
print("Model saved to model.joblib")

print("\nModel training complete and files saved successfully!")
