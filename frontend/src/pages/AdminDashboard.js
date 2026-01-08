import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    getAllUsers,
    getAllJobsAdmin,
    getAdminStats,
    getAllApplications,
    deleteUser,
    deleteJobAdmin,
    getRecentActivity,
    logout
} from '../services/api';
import './Dashboard.css';

function AdminDashboard() {
    const navigate = useNavigate();

    const [users, setUsers] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [applications, setApplications] = useState([]);
    const [stats, setStats] = useState({});
    const [activities, setActivities] = useState([]);
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Fetch all data on component mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch all data in parallel
                const [usersData, jobsData, appsData, statsData, activitiesData] = await Promise.all([
                    getAllUsers(),
                    getAllJobsAdmin(),
                    getAllApplications(),
                    getAdminStats(),
                    getRecentActivity()
                ]);

                setUsers(usersData);
                setJobs(jobsData);
                setApplications(appsData);
                setStats(statsData);
                setActivities(activitiesData);
                setLoading(false);
            } catch (err) {
                setError('Failed to load admin data. Please try again.');
                console.error('Error fetching admin data:', err);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleDeleteUser = async (userId, userName) => {
        if (window.confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
            try {
                await deleteUser(userId);
                alert('User deleted successfully!');

                // Refresh users list
                const usersData = await getAllUsers();
                setUsers(usersData);

                // Refresh stats
                const statsData = await getAdminStats();
                setStats(statsData);
            } catch (err) {
                alert(err.message || 'Failed to delete user');
                console.error('Error deleting user:', err);
            }
        }
    };

    const handleDeleteJob = async (jobId, jobTitle) => {
        if (window.confirm(`Are you sure you want to delete job "${jobTitle}"? This action cannot be undone.`)) {
            try {
                await deleteJobAdmin(jobId);
                alert('Job deleted successfully!');

                // Refresh jobs list
                const jobsData = await getAllJobsAdmin();
                setJobs(jobsData);

                // Refresh stats
                const statsData = await getAdminStats();
                setStats(statsData);
            } catch (err) {
                alert(err.message || 'Failed to delete job');
                console.error('Error deleting job:', err);
            }
        }
    };

    if (loading) {
        return (
            <div className="dashboard">
                <div
                    role="status"
                    aria-live="polite"
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100vh',
                        fontSize: '1.5rem',
                        color: '#667eea'
                    }}
                >
                    <span>Loading Admin Dashboard...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard admin-dashboard">
            <a href="#main-content" className="skip-link">Skip to main content</a>

            <header className="dashboard-header" role="banner">
                <div className="header-content">
                    <h1>Admin Dashboard</h1>
                    <button
                        onClick={handleLogout}
                        className="logout-button"
                        aria-label="Log out of admin account"
                    >
                        Logout
                    </button>
                </div>
            </header>

            <main id="main-content" className="dashboard-main" role="main">
                <section className="welcome-section">
                    <h2>Platform Overview</h2>
                    <p>Monitor and manage all platform activities, users, and job postings.</p>
                </section>

                {error && (
                    <div
                        role="alert"
                        aria-live="assertive"
                        style={{
                            background: '#fee',
                            border: '1px solid #fcc',
                            padding: '1rem',
                            borderRadius: '8px',
                            color: '#c33',
                            marginBottom: '1rem'
                        }}
                    >
                        {error}
                    </div>
                )}

                {/* Statistics */}
                <section className="stats-section admin-stats" aria-label="Platform statistics">
                    <div className="stat-card">
                        <h3>{stats.totalUsers || 0}</h3>
                        <p>Total Users</p>
                    </div>
                    <div className="stat-card">
                        <h3>{stats.jobSeekers || 0}</h3>
                        <p>Job Seekers</p>
                    </div>
                    <div className="stat-card">
                        <h3>{stats.employers || 0}</h3>
                        <p>Employers</p>
                    </div>
                    <div className="stat-card">
                        <h3>{stats.activeJobs || 0}</h3>
                        <p>Active Jobs</p>
                    </div>
                    <div className="stat-card">
                        <h3>{stats.totalApplications || 0}</h3>
                        <p>Total Applications</p>
                    </div>
                    <div className="stat-card">
                        <h3>{stats.pendingApplications || 0}</h3>
                        <p>Pending Applications</p>
                    </div>
                </section>

                {/* Navigation Tabs */}
                <section className="admin-tabs" role="tablist" aria-label="Admin dashboard tabs">
                    <button
                        className={activeTab === 'overview' ? 'tab-button active' : 'tab-button'}
                        onClick={() => setActiveTab('overview')}
                        role="tab"
                        aria-selected={activeTab === 'overview'}
                        aria-controls="overview-panel"
                    >
                        Overview
                    </button>
                    <button
                        className={activeTab === 'users' ? 'tab-button active' : 'tab-button'}
                        onClick={() => setActiveTab('users')}
                        role="tab"
                        aria-selected={activeTab === 'users'}
                        aria-controls="users-panel"
                    >
                        Manage Users ({users.length})
                    </button>
                    <button
                        className={activeTab === 'jobs' ? 'tab-button active' : 'tab-button'}
                        onClick={() => setActiveTab('jobs')}
                        role="tab"
                        aria-selected={activeTab === 'jobs'}
                        aria-controls="jobs-panel"
                    >
                        Manage Jobs ({jobs.length})
                    </button>
                    <button
                        className={activeTab === 'applications' ? 'tab-button active' : 'tab-button'}
                        onClick={() => setActiveTab('applications')}
                        role="tab"
                        aria-selected={activeTab === 'applications'}
                        aria-controls="applications-panel"
                    >
                        Applications ({applications.length})
                    </button>
                </section>

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <section className="admin-content" id="overview-panel" role="tabpanel" aria-labelledby="overview-tab">
                        <h2>Recent Activity</h2>
                        {activities.length === 0 ? (
                            <p style={{ color: '#718096', fontSize: '1.1rem' }} role="status">
                                No recent activity to display.
                            </p>
                        ) : (
                            <div className="activity-list">
                                {activities.map((activity, index) => (
                                    <div key={index} className="activity-item">
                                        <span className="activity-icon" aria-hidden="true">✉️</span>
                                        <p>
                                            <strong>{activity.user_name}</strong> applied for <strong>{activity.job_title}</strong> at {activity.company_name}
                                        </p>
                                        <span className="activity-time">
                                            {new Date(activity.timestamp).toLocaleDateString()}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}

                        <h2 style={{ marginTop: '2rem' }}>Quick Stats</h2>
                        <div className="stats-section" style={{ marginTop: '1rem' }}>
                            <div className="stat-card">
                                <h3>{stats.acceptedApplications || 0}</h3>
                                <p>Accepted Applications</p>
                            </div>
                            <div className="stat-card">
                                <h3>{stats.rejectedApplications || 0}</h3>
                                <p>Rejected Applications</p>
                            </div>
                            <div className="stat-card">
                                <h3>{((stats.acceptedApplications / stats.totalApplications) * 100 || 0).toFixed(1)}%</h3>
                                <p>Acceptance Rate</p>
                            </div>
                        </div>
                    </section>
                )}

                {/* Users Tab */}
                {activeTab === 'users' && (
                    <section className="admin-content" id="users-panel" role="tabpanel" aria-labelledby="users-tab">
                        <h2>All Users</h2>
                        {users.length === 0 ? (
                            <p style={{ color: '#718096', fontSize: '1.1rem' }} role="status">
                                No users found.
                            </p>
                        ) : (
                            <div className="admin-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th scope="col">ID</th>
                                            <th scope="col">Name</th>
                                            <th scope="col">Email</th>
                                            <th scope="col">Type</th>
                                            <th scope="col">Company</th>
                                            <th scope="col">Joined</th>
                                            <th scope="col">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map(user => (
                                            <tr key={user.id}>
                                                <td>{user.id}</td>
                                                <td>{user.name}</td>
                                                <td>{user.email}</td>
                                                <td>
                                                    <span className={`type-badge ${user.user_type.toLowerCase().replace(' ', '-')}`}>
                                                        {user.user_type}
                                                    </span>
                                                </td>
                                                <td>{user.company_name || '-'}</td>
                                                <td>{new Date(user.created_at).toLocaleDateString()}</td>
                                                <td>
                                                    <button
                                                        className="admin-action-btn view"
                                                        onClick={() => alert(`View details for ${user.name}\nEmail: ${user.email}\nType: ${user.user_type}`)}
                                                        aria-label={`View details for ${user.name}`}
                                                    >
                                                        View
                                                    </button>
                                                    <button
                                                        className="admin-action-btn delete"
                                                        onClick={() => handleDeleteUser(user.id, user.name)}
                                                        aria-label={`Delete user ${user.name}`}
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                )}

                {/* Jobs Tab */}
                {activeTab === 'jobs' && (
                    <section className="admin-content" id="jobs-panel" role="tabpanel" aria-labelledby="jobs-tab">
                        <h2>All Job Postings</h2>
                        {jobs.length === 0 ? (
                            <p style={{ color: '#718096', fontSize: '1.1rem' }} role="status">
                                No jobs posted yet.
                            </p>
                        ) : (
                            <div className="admin-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th scope="col">ID</th>
                                            <th scope="col">Job Title</th>
                                            <th scope="col">Company</th>
                                            <th scope="col">Location</th>
                                            <th scope="col">Type</th>
                                            <th scope="col">Applicants</th>
                                            <th scope="col">Status</th>
                                            <th scope="col">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {jobs.map(job => (
                                            <tr key={job.id}>
                                                <td>{job.id}</td>
                                                <td>{job.title}</td>
                                                <td>{job.company_name}</td>
                                                <td>{job.location}</td>
                                                <td>{job.job_type}</td>
                                                <td>{job.applicant_count}</td>
                                                <td>
                                                    <span className="status-badge active">{job.status}</span>
                                                </td>
                                                <td>
                                                    <button
                                                        className="admin-action-btn view"
                                                        onClick={() => alert(`Job: ${job.title}\nCompany: ${job.company_name}\nDescription: ${job.description}\nSalary: ${job.salary}\nAccessibility: ${job.accessibility_features}`)}
                                                        aria-label={`View details for ${job.title}`}
                                                    >
                                                        View
                                                    </button>
                                                    <button
                                                        className="admin-action-btn delete"
                                                        onClick={() => handleDeleteJob(job.id, job.title)}
                                                        aria-label={`Delete job ${job.title}`}
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                )}

                {/* Applications Tab */}
                {activeTab === 'applications' && (
                    <section className="admin-content" id="applications-panel" role="tabpanel" aria-labelledby="applications-tab">
                        <h2>All Applications</h2>
                        {applications.length === 0 ? (
                            <p style={{ color: '#718096', fontSize: '1.1rem' }} role="status">
                                No applications yet.
                            </p>
                        ) : (
                            <div className="admin-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th scope="col">ID</th>
                                            <th scope="col">Job Seeker</th>
                                            <th scope="col">Job</th>
                                            <th scope="col">Company</th>
                                            <th scope="col">Status</th>
                                            <th scope="col">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {applications.map(app => (
                                            <tr key={app.id}>
                                                <td>{app.id}</td>
                                                <td>{app.job_seeker_name}</td>
                                                <td>{app.job_title}</td>
                                                <td>{app.company_name}</td>
                                                <td>
                                                    <span className={`status-badge ${app.status.toLowerCase()}`}>
                                                        {app.status}
                                                    </span>
                                                </td>
                                                <td>{new Date(app.applied_at).toLocaleDateString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                )}
            </main>
        </div>
    );
}

export default AdminDashboard;