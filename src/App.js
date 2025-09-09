import React from 'react';
import { BrowserRouter, Routes, Route, NavLink, useLocation, useNavigate, useSearchParams, Link, useParams } from 'react-router-dom';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title } from 'chart.js';
import { Doughnut, Bar, Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title);

const API_BASE_URL = 'http://127.0.0.1:5000';

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

// --- Reusable Components ---
const icons = {
    Dashboard: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>,
    Students: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" /></svg>,
    Courses: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L9 9.61v5.07L2.95 11.88a1 1 0 00-1.9 1.04l7 3a1 1 0 00.95.04l7-3a1 1 0 00-1-1.88L11 14.68V9.61l5.656-2.67a1 1 0 000-1.84l-7-3zM12 10a2 2 0 100-4 2 2 0 000 4z" /></svg>,
    Reports: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>,
    Settings: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01-.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>,
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
        <header className="bg-white/80 backdrop-blur-sm shadow-sm p-4 flex justify-between items-center border-b border-slate-200">
            <h1 className="text-2xl font-bold text-slate-800">E-Learning Analytics</h1>
            <form onSubmit={handleSearch} className="relative">
                <input 
                    type="text" 
                    placeholder="Search by UserID or Course..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border rounded-md py-2 pl-3 pr-10 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition w-64" 
                />
                <button type="submit" className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-indigo-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                </button>
            </form>
        </header>
    );
};

const Sidebar = () => (
    <aside className="w-64 bg-slate-800 text-slate-300 p-4 flex flex-col">
        <Link to="/" className="text-white text-lg font-bold mb-8 flex items-center gap-2 hover:text-indigo-400 transition-colors">
            <svg className="w-8 h-8 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>
            <span>CAPSTONE PROJECT</span>
        </Link>
        <nav>
            <ul>
                {Object.entries(icons).map(([name, icon]) => (
                    <li key={name} className="mb-2">
                        <NavLink to={name === 'Dashboard' ? '/' : `/${name.toLowerCase()}`} className={({ isActive }) => `w-full text-left p-2.5 rounded-md flex items-center gap-3 transition-all duration-200 ${isActive ? 'bg-indigo-600 text-white shadow-lg' : 'hover:bg-slate-700 hover:translate-x-1'}`}>
                            {icon}
                            <span className="font-medium">{name}</span>
                        </NavLink>
                    </li>
                ))}
            </ul>
        </nav>
    </aside>
);

const ChartCard = ({ title, children, delay, isLoading }) => ( <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border border-slate-200 animate-fade-in-up" style={{ animationDelay: delay }}><h3 className="text-lg font-semibold mb-4 text-slate-700">{title}</h3><div className="h-64">{isLoading ? <LoadingSpinner /> : children}</div></div>);
const LoadingSpinner = () => (<div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div></div>);
const PageContainer = ({ title, children, isLoading }) => (<div className="p-6 bg-slate-50 animate-fade-in"><h1 className="text-3xl font-bold mb-6 text-slate-800 animate-fade-in-up">{title}</h1><div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>{isLoading ? <LoadingSpinner/> : children}</div></div>);

const StudentTable = ({ students }) => {
    const { items, requestSort, sortConfig } = useSortableData(students);

    const getSortIndicator = (name) => {
        if (!sortConfig || sortConfig.key !== name) {
            return <span className="text-slate-400">↕</span>;
        }
        return sortConfig.direction === 'ascending' ? '🔼' : '🔽';
    };

    const headers = [
        { key: 'id', label: 'User ID' },
        { key: 'course', label: 'Course' },
        { key: 'progress', label: 'Progress (%)' },
        { key: 'score', label: 'Score' },
        { key: 'timeSpent', label: 'Time (hrs)' },
        { key: 'PredictedEngagement', label: 'Engagement' }
    ];

    return (
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md border border-slate-200 mt-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <h3 className="text-xl font-semibold mb-4 text-slate-800">Student Details</h3>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white">
                    <thead className="bg-slate-50">
                        <tr>
                            {headers.map(header => (
                                <th key={header.key} className="py-3 px-4 border-b text-left text-sm font-semibold text-slate-600">
                                    <button onClick={() => requestSort(header.key)} className="flex items-center gap-2">
                                        {header.label} {getSortIndicator(header.key)}
                                    </button>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                        {items.map(student => (
                            <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                                <td className="py-3 px-4 font-mono text-slate-800">{student.id}</td>
                                <td className="py-3 px-4 text-slate-600">{student.course}</td>
                                <td className="py-3 px-4 text-center">{student.progress.toFixed(2)}</td>
                                <td className="py-3 px-4 text-center">{student.score.toFixed(2)}</td>
                                <td className="py-3 px-4 text-center">{student.timeSpent.toFixed(2)}</td>
                                <td className="py-3 px-4 text-center">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                        student.PredictedEngagement === 'High' ? 'bg-emerald-100 text-emerald-800' :
                                        student.PredictedEngagement === 'Medium' ? 'bg-amber-100 text-amber-800' :
                                        'bg-red-100 text-red-800'
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
    const [students, setStudents] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        setIsLoading(true);
        const fetchData = async () => {
            try {
                const [statsRes, studentsRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/api/dashboard_stats`),
                    fetch(`${API_BASE_URL}/api/students`)
                ]);
                if (!statsRes.ok || !studentsRes.ok) throw new Error('Network response was not ok');
                const statsData = await statsRes.json();
                const studentsData = await studentsRes.json();
                setStats(statsData);
                setStudents(studentsData);
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const chartData = {
        engagement: { labels: stats?.engagement.labels || [], datasets: [{ data: stats?.engagement.values || [], backgroundColor: ['#10B981', '#F59E0B', '#EF4444'], borderColor: '#F9FAFB' }] },
        completion: { labels: stats?.completion.labels || [], datasets: [{ data: stats?.completion.values || [], backgroundColor: ['#3B82F6', '#E5E7EB'], borderColor: '#F9FAFB' }] },
        averageScores: { labels: stats?.averageScores.labels || [], datasets: [{ label: 'Average Score', data: stats?.averageScores.values || [], backgroundColor: 'rgba(59, 130, 246, 0.7)', borderRadius: 4 }] },
        averageTime: { labels: stats?.averageTime.labels || [], datasets: [{ label: 'Average Time (Hours)', data: stats?.averageTime.values || [], backgroundColor: 'rgba(16, 185, 129, 0.7)', borderRadius: 4 }] }
    };
    
    const barChartOptions = { maintainAspectRatio: false, scales: { x: { ticks: { maxRotation: 0, minRotation: 0, autoSkip: false } }, y: { beginAtZero: true } }, plugins: { legend: { display: false } } };

    return (
        <div className="bg-slate-50 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                <ChartCard title="Predicted Engagement" delay="0ms" isLoading={isLoading}><Doughnut data={chartData.engagement} options={{ maintainAspectRatio: false }} /></ChartCard>
                <ChartCard title="Course Completion" delay="100ms" isLoading={isLoading}><Pie data={chartData.completion} options={{ maintainAspectRatio: false }} /></ChartCard>
                <ChartCard title="Average Scores" delay="200ms" isLoading={isLoading}><Bar data={chartData.averageScores} options={barChartOptions} /></ChartCard>
                <ChartCard title="Average Time Spent per Course" delay="300ms" isLoading={isLoading}><Bar data={chartData.averageTime} options={barChartOptions} /></ChartCard>
            </div>
            { !isLoading && <StudentTable students={students.slice(0, 10)} /> }
        </div>
    );
};

const StudentsPage = () => {
    const [students, setStudents] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(true);
    React.useEffect(() => {
        setIsLoading(true);
        fetch(`${API_BASE_URL}/api/students`).then(res => res.json()).then(data => {
            setStudents(data);
            setIsLoading(false);
        }).catch(err => {
            console.error(err);
            setIsLoading(false);
        });
    }, []);

    return <PageContainer title="All Students" isLoading={isLoading}><StudentTable students={students} /></PageContainer>;
};

const CoursesPage = () => {
    const [courses, setCourses] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(true);
    React.useEffect(() => {
        setIsLoading(true);
        fetch(`${API_BASE_URL}/api/courses`).then(res => res.json()).then(data => {
            setCourses(data);
            setIsLoading(false);
        }).catch(err => {
            console.error(err);
            setIsLoading(false);
        });
    }, []);

    return (
        <PageContainer title="Course Overview" isLoading={isLoading}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course, index) => (
                    <Link to={`/courses/${encodeURIComponent(course.title)}`} key={course.title} className="block hover:no-underline">
                        <div className={`bg-white p-6 rounded-xl shadow-md border-t-4 ${course.color} hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-in-up`} style={{ animationDelay: `${index * 100}ms` }}>
                            <h2 className="text-xl font-bold mb-2 text-slate-800">{course.title}</h2>
                            <p className="text-slate-600">Enrolled Students: {course.students}</p>
                            <p className="text-slate-600">Average Progress: {course.avgProgress}%</p>
                            <div className="w-full bg-slate-200 rounded-full h-2.5 mt-4"><div className="bg-indigo-500 h-2.5 rounded-full" style={{ width: `${course.avgProgress}%` }}></div></div>
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

    React.useEffect(() => {
        if (courseName) {
            setIsLoading(true);
            fetch(`${API_BASE_URL}/api/courses/${encodeURIComponent(courseName)}`)
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
    }, [courseName]);

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

    React.useEffect(() => {
        if (query) {
            setIsLoading(true);
            fetch(`${API_BASE_URL}/api/search?q=${encodeURIComponent(query)}`)
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
    }, [query]);

    return (
        <PageContainer title={`Search Results for "${query}"`} isLoading={isLoading}>
            {results.length > 0 ? (
                <StudentTable students={results} />
            ) : (
                <p className="text-slate-600">No results found for your query.</p>
            )}
        </PageContainer>
    );
};

const ReportsPage = () => {
    const [students, setStudents] = React.useState([]);
    const [courses, setCourses] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(true);
    
    // Filters
    const [selectedCourse, setSelectedCourse] = React.useState('All');
    const [selectedEngagement, setSelectedEngagement] = React.useState('All');

    React.useEffect(() => {
        const fetchInitialData = async () => {
            setIsLoading(true);
            try {
                const [studentsRes, coursesRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/api/students`),
                    fetch(`${API_BASE_URL}/api/courses`)
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
    }, []);

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
            <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
                <h2 className="text-xl font-bold mb-4 text-slate-800">Report Filters</h2>
                <p className="text-slate-600 mb-6">Select criteria to generate a custom student report.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Course Filter */}
                    <div>
                        <label htmlFor="course-filter" className="block text-sm font-medium text-slate-700 mb-1">Course</label>
                        <select 
                            id="course-filter"
                            value={selectedCourse}
                            onChange={(e) => setSelectedCourse(e.target.value)}
                            className="w-full p-2 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="All">All Courses</option>
                            {courses.map(course => <option key={course.title} value={course.title}>{course.title}</option>)}
                        </select>
                    </div>

                    {/* Engagement Filter */}
                    <div>
                        <label htmlFor="engagement-filter" className="block text-sm font-medium text-slate-700 mb-1">Engagement Level</label>
                        <select 
                            id="engagement-filter"
                            value={selectedEngagement}
                            onChange={(e) => setSelectedEngagement(e.target.value)}
                            className="w-full p-2 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="All">All Levels</option>
                            <option value="High">High</option>
                            <option value="Medium">Medium</option>
                            <option value="Low">Low</option>
                        </select>
                    </div>

                    {/* Download Button */}
                    <div className="self-end">
                        <button 
                            onClick={handleDownload} 
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-5 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                        >
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
const SettingsPage = () => <PageContainer title="Settings"><div>Application settings will be configured here.</div></PageContainer>;


// --- Main App Layout ---
const AppLayout = () => {
    const location = useLocation();
    return (
        <div className="flex h-screen bg-slate-50 font-sans">
            <style>{`@keyframes fade-in-up { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } } .animate-fade-in-up { animation: fade-in-up 0.5s ease-in-out forwards; opacity: 0; } `}</style>
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main key={location.pathname} className="flex-1 overflow-x-hidden overflow-y-auto animate-fade-in-up" style={{ animationDelay: '50ms' }}>
                    <Routes>
                        <Route path="/" element={<DashboardPage />} />
                        <Route path="/students" element={<StudentsPage />} />
                        <Route path="/courses" element={<CoursesPage />} />
                        <Route path="/courses/:courseName" element={<CourseDetailPage />} />
                        <Route path="/reports" element={<ReportsPage />} />
                        <Route path="/settings" element={<SettingsPage />} />
                        <Route path="/search" element={<SearchPage />} />
                    </Routes>
                </main>
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
      <AppLayout />
    </BrowserRouter>
  );
}