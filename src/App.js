import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title } from 'chart.js';
import { Doughnut, Bar, Line, Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title);

// Mock Data with Indian Names
const initialStudentData = [
    { id: 1, name: 'Vasanth', course: 'Introduction to React', progress: 85, score: 92, timeSpent: 12, predictedEngagement: 'High' },
    { id: 2, name: 'Vishnu', course: 'Advanced CSS', progress: 60, score: 78, timeSpent: 8, predictedEngagement: 'Medium' },
    { id: 3, name: 'Kowshik', course: 'JavaScript Fundamentals', progress: 45, score: 65, timeSpent: 5, predictedEngagement: 'Low' },
    { id: 4, name: 'Sowmya', course: 'State Management with Redux', progress: 95, score: 98, timeSpent: 15, predictedEngagement: 'High' },
    { id: 5, name: 'Nitish', course: 'Introduction to React', progress: 70, score: 85, timeSpent: 10, predictedEngagement: 'Medium' },
    { id: 6, name: 'Gopi', course: 'Advanced CSS', progress: 30, score: 55, timeSpent: 4, predictedEngagement: 'Low' },
];

const coursesData = [
    { id: 1, title: 'Introduction to React', students: 2, avgProgress: 77.5, color: 'border-sky-500' },
    { id: 2, title: 'Advanced CSS', students: 2, avgProgress: 45, color: 'border-emerald-500' },
    { id: 3, title: 'JavaScript Fundamentals', students: 1, avgProgress: 45, color: 'border-amber-500' },
    { id: 4, title: 'State Management with Redux', students: 1, avgProgress: 95, color: 'border-violet-500' },
];

const engagementData = {
    labels: ['High', 'Medium', 'Low'],
    datasets: [
        {
            label: 'Predicted Engagement',
            data: [
                initialStudentData.filter(s => s.predictedEngagement === 'High').length,
                initialStudentData.filter(s => s.predictedEngagement === 'Medium').length,
                initialStudentData.filter(s => s.predictedEngagement === 'Low').length,
            ],
            backgroundColor: ['#10B981', '#F59E0B', '#EF4444'],
            borderColor: '#F9FAFB',
            borderWidth: 2,
        },
    ],
};

const courseCompletionData = {
    labels: ['Completed', 'In Progress'],
    datasets: [
        {
            data: [
                initialStudentData.filter(s => s.progress >= 80).length,
                initialStudentData.filter(s => s.progress < 80).length,
            ],
            backgroundColor: ['#3B82F6', '#E5E7EB'],
            borderColor: '#F9FAFB',
            borderWidth: 2,
        },
    ],
};

const averageScoresData = {
    labels: [['Intro to', 'React'], ['Advanced', 'CSS'], ['JS', 'Fundamentals'], 'Redux'],
    datasets: [
        {
            label: 'Average Score',
            data: [90, 72, 65, 98],
            backgroundColor: 'rgba(59, 130, 246, 0.7)',
            borderRadius: 4,
        },
    ],
};

const barChartOptions = {
    maintainAspectRatio: false,
    scales: {
        x: {
            ticks: {
                maxRotation: 0,
                minRotation: 0,
                autoSkip: false,
            },
        },
        y: {
            beginAtZero: true,
        },
    },
    plugins: {
        legend: {
            display: false,
        },
    },
};


const timeSpentData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
        {
            label: 'Avg Time Spent (Hours)',
            data: [5, 7, 6, 8],
            fill: true,
            backgroundColor: 'rgba(16, 185, 129, 0.2)',
            borderColor: '#10B981',
            tension: 0.3,
        },
    ],
};


// SVG Icons for Sidebar
const icons = {
    Dashboard: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>,
    Students: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" /></svg>,
    Courses: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L9 9.61v5.07L2.95 11.88a1 1 0 00-1.9 1.04l7 3a1 1 0 00.95.04l7-3a1 1 0 00-1-1.88L11 14.68V9.61l5.656-2.67a1 1 0 000-1.84l-7-3zM12 10a2 2 0 100-4 2 2 0 000 4z" /></svg>,
    Reports: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>,
    Settings: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01-.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>,
};

const navLinks = [
    { name: 'Dashboard', path: '/', icon: icons.Dashboard },
    { name: 'Students', path: '/students', icon: icons.Students },
    { name: 'Courses', path: '/courses', icon: icons.Courses },
    { name: 'Reports', path: '/reports', icon: icons.Reports },
    { name: 'Settings', path: '/settings', icon: icons.Settings },
];

// Components
const Header = () => (
    <header className="bg-white/80 backdrop-blur-sm shadow-sm p-4 flex justify-between items-center border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-800">E-Learning Analytics</h1>
        <div>
            <input type="text" placeholder="Search..." className="border rounded-md p-2 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition" />
        </div>
    </header>
);

const Sidebar = () => (
    <aside className="w-64 bg-slate-800 text-slate-300 p-4 flex flex-col">
        <div className="text-white text-lg font-bold mb-8 flex items-center gap-2">
            <svg className="w-8 h-8 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>
            <span>CAPSTONE PROJECT</span>
        </div>
        <nav>
            <ul>
                {navLinks.map(link => (
                     <li key={link.name} className="mb-2">
                        <NavLink 
                            to={link.path}
                            className={({ isActive }) => `w-full text-left p-2.5 rounded-md flex items-center gap-3 transition-all duration-200 ${isActive ? 'bg-indigo-600 text-white shadow-lg' : 'hover:bg-slate-700 hover:translate-x-1'}`}
                        >
                            {link.icon}
                            <span className="font-medium">{link.name}</span>
                        </NavLink>
                    </li>
                ))}
            </ul>
        </nav>
    </aside>
);

const ChartCard = ({ title, children, delay }) => (
    <div 
        className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border border-slate-200 animate-fade-in-up"
        style={{ animationDelay: delay }}
    >
        <h3 className="text-lg font-semibold mb-4 text-slate-700">{title}</h3>
        <div className="h-64">{children}</div>
    </div>
);

const StudentTable = ({ students }) => (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md border border-slate-200 mt-6 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
        <h3 className="text-xl font-semibold mb-4 text-slate-800">Student Overview</h3>
        <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
                <thead className="bg-slate-50">
                    <tr>
                        <th className="py-3 px-4 border-b text-left text-sm font-semibold text-slate-600">Name</th>
                        <th className="py-3 px-4 border-b text-left text-sm font-semibold text-slate-600">Course</th>
                        <th className="py-3 px-4 border-b text-center text-sm font-semibold text-slate-600">Progress</th>
                        <th className="py-3 px-4 border-b text-center text-sm font-semibold text-slate-600">Score</th>
                        <th className="py-3 px-4 border-b text-center text-sm font-semibold text-slate-600">Time (hrs)</th>
                        <th className="py-3 px-4 border-b text-center text-sm font-semibold text-slate-600">Engagement</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                    {students.map(student => (
                        <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-3 px-4">{student.name}</td>
                            <td className="py-3 px-4 text-slate-600">{student.course}</td>
                            <td className="py-3 px-4 text-center">{student.progress}%</td>
                            <td className="py-3 px-4 text-center">{student.score}</td>
                            <td className="py-3 px-4 text-center">{student.timeSpent}</td>
                            <td className="py-3 px-4 text-center">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                    student.predictedEngagement === 'High' ? 'bg-emerald-100 text-emerald-800' :
                                    student.predictedEngagement === 'Medium' ? 'bg-amber-100 text-amber-800' :
                                    'bg-red-100 text-red-800'
                                }`}>
                                    {student.predictedEngagement}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);


const Dashboard = () => {
    return (
        <div className="bg-slate-50 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                <ChartCard title="Predicted Engagement" delay="0ms"><Doughnut data={engagementData} options={{ maintainAspectRatio: false }} /></ChartCard>
                <ChartCard title="Course Completion" delay="100ms"><Pie data={courseCompletionData} options={{ maintainAspectRatio: false }} /></ChartCard>
                <ChartCard title="Average Scores" delay="200ms"><Bar data={averageScoresData} options={barChartOptions} /></ChartCard>
                <ChartCard title="Time Spent on Platform" delay="300ms"><Line data={timeSpentData} options={{ maintainAspectRatio: false }} /></ChartCard>
            </div>
            <StudentTable students={initialStudentData} />
        </div>
    );
};

// Page Components
const StudentsPage = () => (
    <div className="p-6 bg-slate-50 animate-fade-in">
        <h1 className="text-3xl font-bold mb-6 text-slate-800 animate-fade-in-up">Student Management</h1>
        <StudentTable students={initialStudentData} />
    </div>
);

const CoursesPage = () => (
    <div className="p-6 bg-slate-50 animate-fade-in">
        <h1 className="text-3xl font-bold mb-6 text-slate-800 animate-fade-in-up">Course Management</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coursesData.map((course, index) => (
                <div 
                    key={course.id} 
                    className={`bg-white p-6 rounded-xl shadow-md border-t-4 ${course.color} hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-in-up`}
                    style={{ animationDelay: `${index * 100}ms` }}
                >
                    <h2 className="text-xl font-bold mb-2 text-slate-800">{course.title}</h2>
                    <p className="text-slate-600">Enrolled Students: {course.students}</p>
                    <p className="text-slate-600">Average Progress: {course.avgProgress}%</p>
                    <div className="w-full bg-slate-200 rounded-full h-2.5 mt-4">
                        <div className="bg-indigo-500 h-2.5 rounded-full" style={{ width: `${course.avgProgress}%` }}></div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const ReportsPage = () => {
    const handleDownload = (data, filename) => {
        if (window.XLSX) {
            const wb = window.XLSX.utils.book_new();
            const ws = window.XLSX.utils.json_to_sheet(data);
            window.XLSX.utils.book_append_sheet(wb, ws, "Report");
            window.XLSX.writeFile(wb, `${filename}.xlsx`);
        } else {
            console.error("Excel library is not available.");
        }
    };

    const studentEngagementReport = () => handleDownload(initialStudentData, 'StudentEngagementReport');
    const courseCompletionReport = () => {
        const data = initialStudentData.map(({ id, predictedEngagement, ...rest }) => ({ ...rest, status: rest.progress >= 80 ? 'Completed' : 'In Progress' }));
        handleDownload(data, 'CourseCompletionReport');
    };

    return (
         <div className="p-6 bg-slate-50 animate-fade-in">
            <h1 className="text-3xl font-bold mb-6 text-slate-800 animate-fade-in-up">Reports</h1>
            <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                <h2 className="text-xl font-bold mb-4 text-slate-800">Generate New Report</h2>
                <p className="text-slate-600 mb-6">Select the type of report you would like to generate and download.</p>
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                     <button onClick={studentEngagementReport} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-5 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5">Download Student Engagement</button>
                     <button onClick={courseCompletionReport} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-5 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5">Download Course Completion</button>
                </div>
            </div>
        </div>
    );
};

const SettingsPage = () => (
    <div className="p-6 bg-slate-50 animate-fade-in">
        <h1 className="text-3xl font-bold mb-6 text-slate-800 animate-fade-in-up">Settings</h1>
        <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <h2 className="text-xl font-bold mb-4 text-slate-800">User Profile</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-slate-700 text-sm font-bold mb-2" htmlFor="username">Username</label>
                    <input className="shadow-sm appearance-none border border-slate-300 rounded w-full py-2 px-3 text-slate-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500" id="username" type="text" placeholder="aarav.sharma" />
                </div>
                <div>
                    <label className="block text-slate-700 text-sm font-bold mb-2" htmlFor="email">Email</label>
                    <input className="shadow-sm appearance-none border border-slate-300 rounded w-full py-2 px-3 text-slate-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500" id="email" type="email" placeholder="aarav.sharma@example.com" />
                </div>
            </div>
             <button className="mt-8 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5" type="button">Save Changes</button>
        </div>
    </div>
);

// Main App Layout
const AppLayout = () => {
    const location = useLocation();
    return (
        <div className="flex h-screen bg-slate-50 font-sans">
            <style>
                {`
                    @keyframes fade-in {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }
                    .animate-fade-in {
                        animation: fade-in 0.5s ease-in-out;
                    }

                    @keyframes fade-in-up {
                        from { opacity: 0; transform: translateY(20px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    .animate-fade-in-up {
                        animation: fade-in-up 0.5s ease-in-out forwards;
                        opacity: 0;
                    }
                `}
            </style>
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main key={location.pathname} className="flex-1 overflow-x-hidden overflow-y-auto">
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/students" element={<StudentsPage />} />
                        <Route path="/courses" element={<CoursesPage />} />
                        <Route path="/reports" element={<ReportsPage />} />
                        <Route path="/settings" element={<SettingsPage />} />
                    </Routes>
                </main>
            </div>
        </div>
    );
};


export default function App() {
    // This useEffect hook is for dynamically loading the xlsx library for report downloads.
    useEffect(() => {
        const script = document.createElement('script');
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
        script.async = true;
        document.head.appendChild(script);
        return () => { document.head.removeChild(script); };
    }, []);

    // The App component now renders the main layout which contains the router logic.
    return (
        <BrowserRouter>
            <AppLayout />
        </BrowserRouter>
    );
}