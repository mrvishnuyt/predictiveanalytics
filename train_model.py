import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
import joblib

print("Starting model training process...")

# Load the dataset
try:
    df = pd.read_csv('online_course_engagement_data.csv')
    print("Dataset loaded successfully.")
except FileNotFoundError:
    print("Error: 'online_course_engagement_data.csv' not found. Make sure it's in the same directory.")
    exit()

# Define features and target
features = ['TimeSpentOnCourse', 'QuizScores', 'CompletionRate']
target = 'CourseCompletion'

# Drop rows with missing values in key columns to prevent errors
df.dropna(subset=features, inplace=True)
print(f"Dataset cleaned. Working with {len(df)} rows.")

X = df[features]
y = df[target]

# Split data for training
X_train, _, y_train, _ = train_test_split(X, y, test_size=0.2, random_state=42)

# Create and train the scaler
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
print("Data scaler has been trained.")

# Create and train the model
model = LogisticRegression(random_state=42)
model.fit(X_train_scaled, y_train)
print("Engagement prediction model has been trained.")

# Save the scaler and the model to files
joblib.dump(scaler, 'scaler.joblib')
joblib.dump(model, 'model.joblib')

print("\nSuccess! 'scaler.joblib' and 'model.joblib' have been created.")
print("You can now commit these files to your Git repository.")

