import React from 'react';
import { BrowserRouter, Routes, Route, NavLink, useLocation, useNavigate, useSearchParams, Link, useParams, Navigate } from 'react-router-dom';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title } from 'chart.js';
import { Doughnut, Bar, Pie } from 'react-chartjs-2';

// --- Chart.js Global Configuration for Dark Theme ---
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title);
ChartJS.defaults.color = '#94a3b8'; // slate-400
ChartJS.defaults.font.family = '"Inter", sans-serif';
ChartJS.defaults.font.weight = '500';

const API_BASE_URL = '';

// --- Authentication Context ---
const AuthContext = React.createContext(null);

const AuthProvider = ({ children }) => {
    const [token, setToken] = React.useState(localStorage.getItem('token'));
    const navigate = useNavigate();

    const loginAction = async (data) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            const res = await response.json();
            if (res.access_token) {
                setToken(res.access_token);
                localStorage.setItem("token", res.access_token);
                navigate("/dashboard"); // Redirect to dashboard on successful login
                return;
            }
            throw new Error(res.msg || "Login failed");
        } catch (err) {
            console.error(err);
            alert(err.message);
        }
    };

    const logOut = () => {
        setToken(null);
        localStorage.removeItem("token");
        navigate("/login");
    };

    return (
        <AuthContext.Provider value={{ token, loginAction, logOut }}>
            {children}
        </AuthContext.Provider>
    );
};

// --- Protected Route Component ---
const ProtectedRoute = ({ children }) => {
    const { token } = React.useContext(AuthContext);
    if (!token) {
        return <Navigate to="/login" replace />;
    }
    return children;
};

// --- Custom Hook for Sorting Table Data ---
const useSortableData = (items, config = null) => {
    const [sortConfig, setSortConfig] = React.useState(config);

    const sortedItems = React.useMemo(() => {
        if (!items) return [];
        let sortableItems = [...items];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];
                if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        return sortableItems;
    }, [items, sortConfig]);

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    return { items: sortedItems, requestSort, sortConfig };
};

// --- Reusable Components (Modern Dark Theme) ---
const icons = {
    Dashboard: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>,
    Students: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" /></svg>,
    Courses: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L9 9.61v5.07L2.95 11.88a1 1 0 00-1.9 1.04l7 3a1 1 0 00.95.04l7-3a1 1 0 00-1-1.88L11 14.68V9.61l5.656-2.67a1 1 0 000-1.84l-7-3zM12 10a2 2 0 100-4 2 2 0 000 4z" /></svg>,
    Reports: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>,
    Settings: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01-.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>,
    Logout: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
};

const Header = () => {
    const [searchTerm, setSearchTerm] = React.useState('');
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
            setSearchTerm('');
        }
    };

    return (
        <header className="bg-gray-900/60 backdrop-blur-md p-4 flex justify-between items-center border-b border-gray-700/50">
            <div /> 
            <form onSubmit={handleSearch} className="relative">
                <input 
                    type="text" 
                    placeholder="Search by UserID or Course..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border border-gray-700 rounded-lg py-2 pl-4 pr-10 bg-gray-800 text-gray-200 focus:bg-gray-700 focus:ring-2 focus:ring-violet-500 transition w-80 placeholder:text-gray-500" 
                />
                <button type="submit" className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-violet-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                </button>
            </form>
        </header>
    );
};

const Sidebar = () => {
    const { logOut } = React.useContext(AuthContext);
    return (
        <aside className="w-64 bg-gray-900/60 backdrop-blur-md text-gray-300 p-4 flex flex-col border-r border-gray-700/50">
            <Link to="/dashboard" className="text-white text-xl font-bold mb-10 flex items-center gap-3 hover:text-violet-400 transition-colors">
                <div className="bg-violet-600/20 p-2 rounded-lg border border-violet-500/30">
                    <svg className="w-7 h-7 text-violet-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>
                </div>
                <span>Capstone Project</span>
            </Link>
            <nav className="flex-grow">
                <ul className="space-y-2">
                    {['Dashboard', 'Students', 'Courses', 'Reports', 'Settings'].map(name => (
                        <li key={name}>
                            <NavLink to={`/${name.toLowerCase()}`} className={({ isActive }) => `w-full text-left p-3 rounded-lg flex items-center gap-3 transition-all duration-200 ${isActive ? 'bg-violet-600 text-white shadow-lg' : 'hover:bg-gray-700/50'}`}>
                                {icons[name]}
                                <span className="font-semibold">{name}</span>
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>
            <button onClick={logOut} className="w-full text-left p-3 rounded-lg flex items-center gap-3 hover:bg-red-700/50 text-red-400 font-semibold transition-colors">
                {icons.Logout}
                <span>Logout</span>
            </button>
        </aside>
    )
};

const ChartCard = ({ title, children, delay, isLoading, className = "" }) => ( <div className={`bg-gray-800/50 p-6 rounded-2xl shadow-lg hover:shadow-violet-500/10 transition-shadow duration-300 border border-gray-700 animate-fade-in-up ${className}`} style={{ animationDelay: delay }}><h3 className="text-lg font-semibold mb-4 text-gray-200">{title}</h3><div className="h-64">{isLoading ? <LoadingSpinner /> : children}</div></div>);
const LoadingSpinner = () => (<div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-violet-500"></div></div>);
const PageContainer = ({ title, children, isLoading }) => (<div className="p-6 animate-fade-in text-white"><h1 className="text-4xl font-bold mb-8 text-gray-100 animate-fade-in-up">{title}</h1><div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>{isLoading ? <LoadingSpinner/> : children}</div></div>);

const StudentTable = ({ students }) => {
    const { items, requestSort, sortConfig } = useSortableData(students);

    const getSortIndicator = (name) => {
        if (!sortConfig || sortConfig.key !== name) {
            return <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" /></svg>;
        }
        return sortConfig.direction === 'ascending' ? '🔼' : '🔽';
    };

    const headers = [
        { key: 'id', label: 'User ID' }, { key: 'course', label: 'Course' }, { key: 'progress', label: 'Progress (%)' },
        { key: 'score', label: 'Score' }, { key: 'timeSpent', label: 'Time (hrs)' }, { key: 'PredictedEngagement', label: 'Engagement' }
    ];

    return (
        <div className="bg-gray-800/50 p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-700 mt-8 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <h3 className="text-xl font-semibold mb-4 text-gray-100">Student Details</h3>
            <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead className="border-b border-gray-700">
                        <tr>
                            {headers.map(header => (
                                <th key={header.key} className="py-3 px-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                    <button onClick={() => requestSort(header.key)} className="flex items-center gap-2 hover:text-white transition-colors">
                                        {header.label} {getSortIndicator(header.key)}
                                    </button>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {items.map(student => (
                            <tr key={student.id} className="hover:bg-gray-700/30 transition-colors">
                                <td className="py-4 px-4 font-mono text-gray-300">{student.id}</td>
                                <td className="py-4 px-4 text-gray-400">{student.course}</td>
                                <td className="py-4 px-4 text-center text-gray-300">{student.progress.toFixed(2)}</td>
                                <td className="py-4 px-4 text-center text-gray-300">{student.score.toFixed(2)}</td>
                                <td className="py-4 px-4 text-center text-gray-300">{student.timeSpent.toFixed(2)}</td>
                                <td className="py-4 px-4 text-center">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                        student.PredictedEngagement === 'High' ? 'bg-green-900 text-green-300' :
                                        student.PredictedEngagement === 'Medium' ? 'bg-yellow-900 text-yellow-300' :
                                        'bg-red-900 text-red-300'
                                    }`}>{student.PredictedEngagement}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};


// --- Page Implementations ---

const DashboardPage = () => {
    const [stats, setStats] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const { token } = React.useContext(AuthContext);

    React.useEffect(() => {
        setIsLoading(true);
        const fetchData = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/dashboard_stats`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (!res.ok) throw new Error('Network response was not ok');
                const data = await res.json();
                setStats(data);
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [token]);

    const chartData = {
        engagement: { labels: stats?.engagement.labels || [], datasets: [{ data: stats?.engagement.values || [], backgroundColor: ['#10b981', '#f59e0b', '#ef4444'], borderColor: '#1f2937', borderWidth: 2 }] },
        completion: { labels: stats?.completion.labels || [], datasets: [{ data: stats?.completion.values || [], backgroundColor: ['#6366f1', '#4b5563'], borderColor: '#1f2937', borderWidth: 2 }] },
        scoreDistribution: { labels: stats?.scoreDistribution.labels || [], datasets: [{ label: 'Number of Students', data: stats?.scoreDistribution.values || [], backgroundColor: 'rgba(139, 92, 241, 0.6)', borderRadius: 4 }] },
        studentsPerCourse: { labels: stats?.studentsPerCourse.labels || [], datasets: [{ label: 'Number of Students', data: stats?.studentsPerCourse.values || [], backgroundColor: 'rgba(56, 189, 248, 0.6)', borderRadius: 4 }] }
    };
    
    const barChartOptions = { maintainAspectRatio: false, scales: { x: { grid: { color: 'rgba(255,255,255,0.1)' } }, y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.1)' } } }, plugins: { legend: { display: false } } };
    const pieChartOptions = { maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { color: '#94a3b8' } } } };

    return (
        <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <ChartCard title="Predicted Engagement" delay="0ms" isLoading={isLoading}><Doughnut data={chartData.engagement} options={pieChartOptions} /></ChartCard>
                <ChartCard title="Course Completion" delay="100ms" isLoading={isLoading}><Pie data={chartData.completion} options={pieChartOptions} /></ChartCard>
                <ChartCard title="Quiz Score Distribution" delay="200ms" isLoading={isLoading}><Bar data={chartData.scoreDistribution} options={barChartOptions} /></ChartCard>
                <ChartCard title="Students per Course" delay="300ms" isLoading={isLoading} className="lg:col-span-3"><Bar data={chartData.studentsPerCourse} options={barChartOptions} /></ChartCard>
            </div>
        </div>
    );
};

const StudentsPage = () => {
    const [students, setStudents] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const { token } = React.useContext(AuthContext);

    React.useEffect(() => {
        setIsLoading(true);
        fetch(`${API_BASE_URL}/api/students`, { headers: { Authorization: `Bearer ${token}` } })
            .then(res => res.json())
            .then(data => {
                setStudents(data);
                setIsLoading(false);
            }).catch(err => {
                console.error(err);
                setIsLoading(false);
            });
    }, [token]);

    return <PageContainer title="All Students" isLoading={isLoading}><StudentTable students={students} /></PageContainer>;
};

const CoursesPage = () => {
    const [courses, setCourses] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const { token } = React.useContext(AuthContext);

    React.useEffect(() => {
        setIsLoading(true);
        fetch(`${API_BASE_URL}/api/courses`, { headers: { Authorization: `Bearer ${token}` } })
            .then(res => res.json())
            .then(data => {
                setCourses(data);
                setIsLoading(false);
            }).catch(err => {
                console.error(err);
                setIsLoading(false);
            });
    }, [token]);

    return (
        <PageContainer title="Course Overview" isLoading={isLoading}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course, index) => (
                    <Link to={`/courses/${encodeURIComponent(course.title)}`} key={course.title} className="block hover:no-underline">
                        <div className={`bg-gray-800/50 p-6 rounded-2xl shadow-lg border-t-4 ${course.color} hover:shadow-violet-500/10 transition-all duration-300 hover:-translate-y-1 animate-fade-in-up`} style={{ animationDelay: `${index * 100}ms` }}>
                            <h2 className="text-xl font-bold mb-2 text-gray-100">{course.title}</h2>
                            <p className="text-gray-400">Enrolled Students: {course.students}</p>
                            <p className="text-gray-400">Average Progress: {course.avgProgress}%</p>
                            <div className="w-full bg-gray-700 rounded-full h-2.5 mt-4"><div className="bg-violet-600 h-2.5 rounded-full" style={{ width: `${course.avgProgress}%` }}></div></div>
                        </div>
                    </Link>
                ))}
            </div>
        </PageContainer>
    );
};

const CourseDetailPage = () => {
    const { courseName } = useParams();
    const [students, setStudents] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const { token } = React.useContext(AuthContext);

    React.useEffect(() => {
        if (courseName) {
            setIsLoading(true);
            fetch(`${API_BASE_URL}/api/courses/${encodeURIComponent(courseName)}`, { headers: { Authorization: `Bearer ${token}` } })
                .then(res => res.json())
                .then(data => {
                    setStudents(data);
                    setIsLoading(false);
                })
                .catch(err => {
                    console.error("Failed to fetch course details:", err);
                    setIsLoading(false);
                });
        }
    }, [courseName, token]);

    return (
        <PageContainer title={`Students in "${decodeURIComponent(courseName)}"`} isLoading={isLoading}>
            <StudentTable students={students} />
        </PageContainer>
    );
};

const SearchPage = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q');
    const [results, setResults] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const { token } = React.useContext(AuthContext);

    React.useEffect(() => {
        if (query) {
            setIsLoading(true);
            fetch(`${API_BASE_URL}/api/search?q=${encodeURIComponent(query)}`, { headers: { Authorization: `Bearer ${token}` } })
                .then(res => res.json())
                .then(data => {
                    setResults(data);
                    setIsLoading(false);
                })
                .catch(err => {
                    console.error("Search failed:", err);
                    setIsLoading(false);
                });
        }
    }, [query, token]);

    return (
        <PageContainer title={`Search Results for "${query}"`} isLoading={isLoading}>
            {results.length > 0 ? (
                <StudentTable students={results} />
            ) : (
                <p className="text-gray-400">No results found for your query.</p>
            )}
        </PageContainer>
    );
};

const ReportsPage = () => {
    const [students, setStudents] = React.useState([]);
    const [courses, setCourses] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const { token } = React.useContext(AuthContext);
    
    const [selectedCourse, setSelectedCourse] = React.useState('All');
    const [selectedEngagement, setSelectedEngagement] = React.useState('All');

    React.useEffect(() => {
        const fetchInitialData = async () => {
            setIsLoading(true);
            try {
                const [studentsRes, coursesRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/api/students`, { headers: { Authorization: `Bearer ${token}` } }),
                    fetch(`${API_BASE_URL}/api/courses`, { headers: { Authorization: `Bearer ${token}` } })
                ]);
                const studentsData = await studentsRes.json();
                const coursesData = await coursesRes.json();
                setStudents(studentsData);
                setCourses(coursesData);
            } catch (error) {
                console.error("Failed to fetch report data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchInitialData();
    }, [token]);

    const handleDownload = () => {
        if (window.XLSX) {
            let filteredStudents = students;
            if (selectedCourse !== 'All') {
                filteredStudents = filteredStudents.filter(s => s.course === selectedCourse);
            }
            if (selectedEngagement !== 'All') {
                filteredStudents = filteredStudents.filter(s => s.PredictedEngagement === selectedEngagement);
            }
            if (filteredStudents.length === 0) {
                alert("No students match the selected filters. Cannot generate an empty report.");
                return;
            }
            const wb = window.XLSX.utils.book_new();
            const ws = window.XLSX.utils.json_to_sheet(filteredStudents);
            window.XLSX.utils.book_append_sheet(wb, ws, "Student Report");
            window.XLSX.writeFile(wb, `Student_Report_${selectedCourse}_${selectedEngagement}.xlsx`);
        } else {
            alert("Excel library is loading, please try again in a moment.");
        }
    };
    
    return (
        <PageContainer title="Generate Reports" isLoading={isLoading}>
            <div className="bg-gray-800/50 p-6 rounded-2xl shadow-lg border border-gray-700">
                <h2 className="text-xl font-bold mb-4 text-gray-100">Report Filters</h2>
                <p className="text-gray-400 mb-6">Select criteria to generate a custom student report.</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div>
                        <label htmlFor="course-filter" className="block text-sm font-medium text-gray-300 mb-1">Course</label>
                        <select id="course-filter" value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)} className="w-full p-2 border border-gray-600 bg-gray-700 text-white rounded-md shadow-sm focus:ring-violet-500 focus:border-violet-500">
                            <option value="All">All Courses</option>
                            {courses.map(course => <option key={course.title} value={course.title}>{course.title}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="engagement-filter" className="block text-sm font-medium text-gray-300 mb-1">Engagement Level</label>
                        <select id="engagement-filter" value={selectedEngagement} onChange={(e) => setSelectedEngagement(e.target.value)} className="w-full p-2 border border-gray-600 bg-gray-700 text-white rounded-md shadow-sm focus:ring-violet-500 focus:border-violet-500">
                            <option value="All">All Levels</option>
                            <option value="High">High</option>
                            <option value="Medium">Medium</option>
                            <option value="Low">Low</option>
                        </select>
                    </div>
                    <div className="self-end">
                        <button onClick={handleDownload} className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-2.5 px-5 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            Download Report
                        </button>
                    </div>
                </div>
            </div>
        </PageContainer>
    );
};

const SettingsPage = () => {
    const { token } = React.useContext(AuthContext);
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [message, setMessage] = React.useState('');

    React.useEffect(() => {
        const fetchProfile = async () => {
            const response = await fetch(`${API_BASE_URL}/api/profile`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                setEmail(data.email);
            }
        };
        fetchProfile();
    }, [token]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setMessage('');
        try {
            const payload = { email };
            if (password) {
                payload.password = password;
            }
            const response = await fetch(`${API_BASE_URL}/api/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.msg || "Update failed");
            setMessage("Profile updated successfully!");
            setPassword(''); // Clear password field after update
        } catch (err) {
            setMessage(err.message);
        }
    };

    return (
        <PageContainer title="Settings">
            <div className="bg-gray-800/50 p-6 rounded-2xl shadow-lg border border-gray-700 max-w-2xl mx-auto">
                <h2 className="text-xl font-bold mb-4 text-gray-100">User Profile</h2>
                <form onSubmit={handleUpdate} className="space-y-6">
                    <div>
                        <label className="text-sm font-bold text-gray-400 block mb-2">Email Address</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-3 bg-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500" />
                    </div>
                    <div>
                        <label className="text-sm font-bold text-gray-400 block mb-2">New Password (optional)</label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Leave blank to keep current password" className="w-full p-3 bg-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500" />
                    </div>
                    {message && <p className={`text-center ${message.includes('success') ? 'text-green-400' : 'text-red-400'}`}>{message}</p>}
                    <button type="submit" className="py-3 px-6 bg-violet-600 hover:bg-violet-700 rounded-lg text-white font-bold transition-colors">Save Changes</button>
                </form>
            </div>
        </PageContainer>
    );
};

// --- Main App Layout ---
const AppLayout = () => {
    const location = useLocation();
    return (
        <div className="flex h-screen bg-gray-900 font-sans text-gray-300">
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'); @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } } .animate-fade-in-up { animation: fade-in-up 0.5s ease-in-out forwards; opacity: 0; } `}</style>
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main key={location.pathname} className="flex-1 overflow-x-hidden overflow-y-auto animate-fade-in-up" style={{ animationDelay: '50ms' }}>
                    <Routes>
                        <Route path="/dashboard" element={<DashboardPage />} />
                        <Route path="/students" element={<StudentsPage />} />
                        <Route path="/courses" element={<CoursesPage />} />
                        <Route path="/courses/:courseName" element={<CourseDetailPage />} />
                        <Route path="/reports" element={<ReportsPage />} />
                        <Route path="/settings" element={<SettingsPage />} />
                        <Route path="/search" element={<SearchPage />} />
                        {/* Redirect from the base protected path to the dashboard */}
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                </main>
            </div>
        </div>
    );
};

const AuthForm = ({ isRegister = false }) => {
    const { loginAction } = React.useContext(AuthContext);
    const [username, setUsername] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [message, setMessage] = React.useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        if (isRegister) {
            try {
                const response = await fetch(`${API_BASE_URL}/api/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password }),
                });
                const data = await response.json();
                if (response.ok) {
                    setMessage("Registration successful! Please log in.");
                } else {
                    throw new Error(data.msg || "Registration failed");
                }
            } catch (err) {
                setMessage(err.message);
            }
        } else {
            loginAction({ username, password });
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center font-sans">
            <div className="w-full max-w-md p-8 space-y-8 bg-gray-800 rounded-2xl shadow-lg border border-gray-700">
                <h2 className="text-3xl font-bold text-center text-white">{isRegister ? "Create Account" : "Welcome Back"}</h2>
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label className="text-sm font-bold text-gray-400 block mb-2">Username</label>
                        <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full p-3 bg-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500" />
                    </div>
                    <div>
                        <label className="text-sm font-bold text-gray-400 block mb-2">Password</label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-3 bg-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500" />
                    </div>
                    {message && <p className="text-center text-red-400">{message}</p>}
                    <button type="submit" className="w-full py-3 px-4 bg-violet-600 hover:bg-violet-700 rounded-lg text-white font-bold transition-colors">{isRegister ? "Register" : "Login"}</button>
                </form>
                <p className="text-center text-gray-400">
                    {isRegister ? "Already have an account? " : "Don't have an account? "}
                    <Link to={isRegister ? "/login" : "/register"} className="font-medium text-violet-400 hover:text-violet-300">
                        {isRegister ? "Sign In" : "Sign Up"}
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default function App() {
  React.useEffect(() => {
    // Load XLSX for Excel reports
    const xlsxScript = document.createElement('script');
    xlsxScript.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
    xlsxScript.async = true;
    document.head.appendChild(xlsxScript);
    
    return () => {
        if (document.head.contains(xlsxScript)) document.head.removeChild(xlsxScript);
    };
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<AuthForm />} />
          <Route path="/register" element={<AuthForm isRegister />} />
          <Route 
            path="/*" 
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
