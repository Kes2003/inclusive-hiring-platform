import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllJobs, applyForJob, getJobSeekerApplications, logout } from '../services/api';
import './Dashboard.css';

function JobSeekerDashboard() {
    const navigate = useNavigate();

    const [jobs, setJobs] = useState([]);
    const [applications, setApplications] = useState([]);
    const [appliedJobIds, setAppliedJobIds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [jobSeekerId, setJobSeekerId] = useState(null);

    // Get user ID from localStorage
    const userId = localStorage.getItem('userId');

    // Fetch jobs and applications on component mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch all jobs
                const jobsData = await getAllJobs();
                setJobs(jobsData);

                // Get job seeker profile to get the actual job_seeker_id
                const profileResponse = await fetch(`http://localhost:5000/api/auth/profile/${userId}`);
                const profileData = await profileResponse.json();

                if (profileData.profile && profileData.profile.id) {
                    const jsId = profileData.profile.id;
                    setJobSeekerId(jsId);

                    // Fetch user's applications
                    const appsData = await getJobSeekerApplications(jsId);
                    setApplications(appsData);

                    // Extract job IDs that user has applied to
                    const appliedIds = appsData.map(app => app.job_id);
                    setAppliedJobIds(appliedIds);
                }

                setLoading(false);
            } catch (err) {
                setError('Failed to load data. Please try again.');
                console.error('Error fetching data:', err);
                setLoading(false);
            }
        };

        fetchData();
    }, [userId]);

    const handleApply = async (jobId) => {
        if (!jobSeekerId) {
            alert('Job Seeker ID not found. Please try logging in again.');
            return;
        }

        if (appliedJobIds.includes(jobId)) {
            alert('You have already applied to this job!');
            return;
        }

        try {
            await applyForJob(jobSeekerId, jobId);

            // Update local state
            setAppliedJobIds([...appliedJobIds, jobId]);
            alert('Application submitted successfully!');

            // Refresh applications
            const appsData = await getJobSeekerApplications(jobSeekerId);
            setApplications(appsData);
        } catch (err) {
            alert(err.message || 'Failed to apply. Please try again.');
            console.error('Error applying:', err);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
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
                    <span>Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard">
            <a href="#main-content" className="skip-link">Skip to main content</a>

            <header className="dashboard-header" role="banner">
                <div className="header-content">
                    <h1>Job Seeker Dashboard</h1>
                    <button
                        onClick={handleLogout}
                        className="logout-button"
                        aria-label="Log out of your account"
                    >
                        Logout
                    </button>
                </div>
            </header>

            <main id="main-content" className="dashboard-main" role="main">
                <section className="welcome-section" aria-labelledby="welcome-heading">
                    <h2 id="welcome-heading">Welcome back!</h2>
                    <p>Browse available job opportunities and apply to positions that match your skills.</p>
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

                <section className="stats-section" aria-label="Dashboard statistics">
                    <div className="stat-card">
                        <h3>{jobs.length}</h3>
                        <p>Available Jobs</p>
                    </div>
                    <div className="stat-card">
                        <h3>{applications.length}</h3>
                        <p>Applications Sent</p>
                    </div>
                    <div className="stat-card">
                        <h3>{applications.filter(app => app.status === 'Accepted').length}</h3>
                        <p>Accepted</p>
                    </div>
                </section>

                <section className="jobs-section" aria-labelledby="jobs-heading">
                    <h2 id="jobs-heading">Available Job Opportunities</h2>

                    {jobs.length === 0 ? (
                        <p style={{ color: '#718096', fontSize: '1.1rem' }} role="status">
                            No jobs available at the moment. Check back later!
                        </p>
                    ) : (
                        <div className="jobs-list" role="list">
                            {jobs.map(job => (
                                <article key={job.id} className="job-card" role="listitem">
                                    <div className="job-header">
                                        <h3>{job.title}</h3>
                                        <span className="job-type" aria-label={`Job type: ${job.job_type}`}>{job.job_type}</span>
                                    </div>

                                    <div className="job-company">
                                        <span><span aria-hidden="true">🏢</span> {job.company_name}</span>
                                    </div>

                                    <div className="job-location">
                                        <span><span aria-hidden="true">📍</span> {job.location}</span>
                                    </div>

                                    {job.salary && (
                                        <div className="job-salary">
                                            <span><span aria-hidden="true">💰</span> {job.salary}</span>
                                        </div>
                                    )}

                                    <p className="job-description">{job.description}</p>

                                    <div className="job-accessibility">
                                        <strong><span aria-hidden="true">♿</span> Accessibility Features:</strong>
                                        <p>{job.accessibility_features}</p>
                                    </div>

                                    <button
                                        onClick={() => handleApply(job.id)}
                                        className={appliedJobIds.includes(job.id) ? 'apply-button applied' : 'apply-button'}
                                        disabled={appliedJobIds.includes(job.id)}
                                        aria-label={appliedJobIds.includes(job.id) ? `Already applied to ${job.title}` : `Apply for ${job.title}`}
                                        aria-pressed={appliedJobIds.includes(job.id)}
                                    >
                                        {appliedJobIds.includes(job.id) ? '✓ Applied' : 'Apply Now'}
                                    </button>
                                </article>
                            ))}
                        </div>
                    )}
                </section>

                {applications.length > 0 && (
                    <section className="jobs-section" aria-labelledby="applications-heading">
                        <h2 id="applications-heading">My Applications</h2>
                        <div className="jobs-list" role="list">
                            {applications.map(app => (
                                <article key={app.id} className="job-card" role="listitem">
                                    <div className="job-header">
                                        <h3>{app.job_title}</h3>
                                        <span
                                            className={`job-type ${app.status.toLowerCase()}`}
                                            aria-label={`Application status: ${app.status}`}
                                        >
                                            {app.status}
                                        </span>
                                    </div>

                                    <div className="job-company">
                                        <span><span aria-hidden="true">🏢</span> {app.company_name}</span>
                                    </div>

                                    <div className="job-location">
                                        <span><span aria-hidden="true">📍</span> {app.location}</span>
                                    </div>

                                    <div className="job-salary">
                                        <span><span aria-hidden="true">📅</span> Applied: {new Date(app.applied_at).toLocaleDateString()}</span>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
}

export default JobSeekerDashboard;